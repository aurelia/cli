const path = require('path');
const gulp = require('gulp');
const {preprocess} = require('preprocess');
const through2 = require('through2');
const _ = require('lodash');
const applicable = require('../applicable');
const {getSupportedVersion} = require('../../dependencies');

const DEFAULT_SKELETON = path.resolve(__dirname, '..', '..', '..', 'skeleton');

// Prepare project vinyl files, but does not write to disk yet.
// @param projectName Name of the project
// @param features Selected feature set
// @param _skeletonDir Optional stub for testing
module.exports = function(projectName, features = [], _skeletonDir) {
  if (!_skeletonDir) _skeletonDir = DEFAULT_SKELETON;

  // Folder "common" is the base template folder
  // Note: have to use /**/* on windows, because \**\* doesn't work as expected.
  const globs = ['common', ...features].map(f =>
    path.join(_skeletonDir, f, '**', '*').replace(/\\/g, '/')
  );

  // Include dot files, skip empty folders.
  return gulp.src(globs, {dot: true, nodir: true})
    // Extract write policy metadata from some-file.ext__skip-if-exists
    // The information is saved on vinyl file for later usage
    .pipe(markWritePolicy())
    // Filter by features on some-file.ext__if_sass_or_less
    .pipe(filterBy(features))
    // Preprocess file content
    .pipe(preprocessContent(projectName, features))
    // Rename file.ext to file.js or file.ts based on feat.babel or feat.typescript
    .pipe(replaceExtname('.ext', applicable(features, 'typescript') ? '.ts' : '.js'))
    // Merge package.json, aurelia.json and README.md.
    // For other duplicated files, take the last one.
    .pipe(mergeFiles())
    // Fillup package.json versions
    .pipe(fillupVersions());
};

const FILE_WITH_WRITE_POLICY = /__(skip|append|ask)-if-exists/;

function markWritePolicy() {
  return through2.obj((file, enc, cb) => {
    if (file.isBuffer()) {
      const match = file.basename.match(FILE_WITH_WRITE_POLICY);
      if (match) {
        const policyStr = match[0];
        const policy = match[1];
        // Only remove the policy token __skip-if-exists
        const cleanBasename = file.basename.slice(0, match.index) +
          file.basename.slice(match.index + policyStr.length);
        // File name becomes some-file.ext or some-file.ext__if_feature
        file.basename = cleanBasename;
        file.writePolicy = policy; // skip, append, or ask
        // If there is no writePolicy on the vinyl file, default behaviour is
        // to overwrite existing file.
        cb(null, file);
        return;
      }
    }
    // No special condition on file name, process as normal
    cb(null, file);
  });
}

const FILTERED_FILE = /^(.+)__if_(.+)$/;

// filter by features on some-file.ext__if_sass_or_less
function filterBy(features) {
  return through2.obj((file, enc, cb) => {
    if (file.isBuffer()) {
      const parts = file.relative.split(/\\|\//);
      const cleanParts = [];
      let filtered = false;

      for (let i = 0, ii = parts.length; i < ii; i++) {
        const part = parts[i];
        const match = part.match(FILTERED_FILE);

        if (match) {
          filtered = true;
          const cleanPart = match[1];
          const condition = match[2];

          if (applicable(features, condition)) {
            // Remove __if_x from the part.
            cleanParts.push(cleanPart);
          } else {
            // Not applicable, skip this file
            cb();
            return;
          }
        } else {
          cleanParts.push(part);
        }
      }

      if (filtered) {
        file.path = path.join(file.base, ...cleanParts);
        cb(null, file);
        return;
      }
    }

    // No special condition on file name, process as normal
    cb(null, file);
  });
}

const BINARY_EXTS = ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.ico'];

function preprocessContent(projectName, features) {
  // Preprocess context:
  // {
  //    projectName: 'aurelia-app',
  //    feat: {webpack: true, vscode: true, ...}
  // }
  const context = {
    // Use cleaned up project name
    projectName: _.kebabCase(projectName),
    feat: {}
  };
  features.forEach(feat => context.feat[feat] = true);

  return through2.obj((file, enc, cb) => {
    const ext = file.extname.toLowerCase();
    // skip binary files
    if (file.isBuffer() && !BINARY_EXTS.includes(ext)) {
      // do all other files (including json) with js mode in preprocess
      const mode = (ext === '.html' || ext === '.xml') ? 'html' : 'js';
      try {
        const contents = preprocess(file.contents.toString('utf8'), context, mode);
        file.contents = Buffer.from(contents);
      } catch (e) {
        throw new Error(`Could not preprocess ${file.path}: ${e.message}`);
      }
    }

    cb(null, file);
  });
}

function replaceExtname(ext, newExt) {
  return through2.obj((file, enc, cb) => {
    if (file.isBuffer() && file.extname === ext) {
      file.extname = newExt;
    }
    cb(null, file);
  });
}

function mergeFiles() {
  const groups = {};
  return through2.obj(
    // capture
    (file, env, cb) => {
      if (file.isBuffer()) {
        if (groups[file.relative]) {
          groups[file.relative].push(file);
        } else {
          groups[file.relative] = [file];
        }
        cb();
      } else {
        cb(null, file);
      }
    },
    // flush
    function(cb) {
      _.each(groups, files => {
        let file;
        if (files.length > 1) {
          file = files.reduce(merge);
        } else {
          file = files[0];
          if (file.extname === '.json') {
            // clean up json file
            const json = fromJson(file.contents.toString('utf8'));
            file.contents = Buffer.from(JSON.stringify(json, null, 2));
          }
        }
        this.push(file);
      });
      cb();
    }
  );
}

function merge(file, nextFile) {
  const relativePath = file.relative.replace(/\\/g, '/'); // normalize windows path

  let merged;
  // If we want, we can open up to merge any json file.
  // if (file.extname === '.json')
  if (relativePath === 'aurelia_project/aurelia.json' || relativePath === 'package.json') {
    const json = fromJson(file.contents.toString('utf8'));
    const json2 = fromJson(nextFile.contents.toString('utf8'));
    _.mergeWith(json, json2, mergeArray);

    if (relativePath === 'aurelia_project/aurelia.json' && _.get(json, 'build.bundles')) {
      // after normal merge, there are maybe duplicated bundles config for vendor-bundle
      const groups = _.groupBy(json.build.bundles, 'name');
      json.build.bundles = _(groups).values().map(duplicates =>
        duplicates.reduce((bundle, bundle2) =>
          // Reverse the merge to make sure the original vendor-bundle
          // prepend is in the bottom
          _.mergeWith(bundle2, bundle, mergeArray)
        )
      );
    }

    file.contents = Buffer.from(JSON.stringify(json, null, 2));
    merged =  file;
  } else if (relativePath === 'README.md') {
    file.contents = Buffer.concat([file.contents, Buffer.from('\n'), nextFile.contents]);
    merged =  file;
  } else {
    // for everything else, just use nextFile to overwrite previous file
    merged = nextFile;
  }

  // allow overwrite writePolicy
  merged.writePolicy = nextFile.writePolicy || file.writePolicy;
  return merged;
}

function fromJson(str) {
  // Use eval instead of JSON.parse, in order to tolerant malformed json.
  // For example, an extra ',' comma due to our preprocess.
  // eslint-disable-next-line no-new-func
  return (new Function(`const json = ${_.trim(str)}; return json;`))();
}

function mergeArray(objValue, srcValue) {
  if (_.isArray(objValue) && _.isArray(srcValue)) {
    return _.uniq(objValue.concat(srcValue));
  }
}

const DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies'];

function fillupVersions() {
  return through2.obj(
    (file, env, cb) => {
      if (file.isBuffer() && file.relative === 'package.json') {
        const json = fromJson(file.contents.toString('utf8'));
        DEP_FIELDS.forEach(field => {
          if (!json[field]) return;
          json[field] = _.mapValues(json[field], (version, name) =>
            version || getSupportedVersion(name)
          );
        });
        file.contents = Buffer.from(JSON.stringify(json, null, 2));
      }
      cb(null, file);
    }
  );
}
