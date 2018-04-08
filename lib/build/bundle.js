'use strict';
const path = require('path');
const os = require('os');
const Convert = require('./convert-source-map');
const fs = require('../file-system');
const SourceInclusion = require('./source-inclusion').SourceInclusion;
const DependencyInclusion = require('./dependency-inclusion').DependencyInclusion;
const Configuration = require('../configuration').Configuration;
const Utils = require('./utils');
const logger = require('aurelia-logging').getLogger('Bundle');

exports.Bundle = class {
  constructor(bundler, config) {
    this.Minimatch = require('minimatch').Minimatch; //nested dep of vinyl-fs
    this.bundler = bundler;
    this.config = config;
    this.dependencies = [];
    this.prepend = (config.prepend || []).filter(x => bundler.itemIncludedInBuild(x)).map(x => typeof x === 'string' ? x : x.path);
    this.append = (config.append || []).filter(x => bundler.itemIncludedInBuild(x)).map(x => typeof x === 'string' ? x : x.path);
    this.moduleId = config.name.replace(path.extname(config.name), '');
    this.hash = '';
    this.includes = (config.source || []);
    this.excludes = [];
    if (this.includes instanceof Array) {
      this.includes = this.includes.map(x => new SourceInclusion(this, x));
    } else {
      this.excludes = (this.includes.exclude || []).map(x => this.createMatcher(x));
      this.includes = this.includes.include.map(x => new SourceInclusion(this, x));
    }
    this.buildOptions = new Configuration(config.options, bundler.buildOptions.getAllOptions());
    this.requiresBuild = true;
    this.fileCache = {};
  }

  static create(bundler, config) {
    let bundle = new exports.Bundle(bundler, config);
    let dependencies = config.dependencies || [];
    let dependenciesToBuild = dependencies
        .filter(x => bundler.itemIncludedInBuild(x));

    return Utils.runSequentially(
        dependenciesToBuild,
        dep => bundler.configureDependency(dep))
    .then(descriptions => {
      return Utils.runSequentially(
        descriptions,
        description => bundle.addDependency(description)
      );
    })
    .then(() => bundle);
  }

  createMatcher(pattern) {
    return new this.Minimatch(pattern, {
      dot: true
    });
  }

  addDependency(description) {
    this.dependencies.push(description);
    let inclusion = new DependencyInclusion(this, description);
    this.includes.push(inclusion);
    return inclusion.traceResources();
  }

  trySubsume(item) {
    let includes = this.includes;

    for (let i = 0, ii = includes.length; i < ii; ++i) {
      if (includes[i].trySubsume(item)) {
        this.requiresBuild = true;
        return true;
      }
    }

    return false;
  }

  transform() {
    if (this.requiresBuild) {
      let index = -1;
      let items = this.includes;

      function doTransform() {
        index++;

        if (index < items.length) {
          return items[index].transform().then(doTransform);
        }

        return Promise.resolve();
      }

      return doTransform();
    }

    return Promise.resolve();
  }

  getDependencyLocations() {
    return this.includes.filter(inclusion => inclusion.description && inclusion.description.location)
      .map(inclusion => {
        let normalizedLocation = path.posix.normalize(inclusion.description.location).replace(/\\/g, '\/');
        return {
          location: normalizedLocation,
          inclusion: inclusion
        };
      });
  }

  getBundledModuleIds() {
    return unique(this.includes.reduce((a, b) => a.concat(b.getAllModuleIds()), [])).sort();
  }

  getBundledFiles() {
    return uniqueBy(this.includes.reduce((a, b) => a.concat(b.getAllFiles()), []), (file) => file.path);
  }

  write(platform) {
    if (!this.requiresBuild) {
      return Promise.resolve();
    }

    let work = Promise.resolve();
    let loaderOptions = this.bundler.loaderOptions;
    let buildOptions = this.buildOptions;
    let files = [];

    if (this.prepend.length) {
      work = work.then(() => addFilesInOrder(this, this.prepend, files));
    }

    if (loaderOptions.configTarget === this.config.name) {
      work = work.then(() => {
        files.push({ contents: '_aureliaConfigureModuleLoader();'});
      });
    }

    // Sort files by path to be sure they will alway be concatenated in the same order.
    let bundleFiles = this.getBundledFiles()
      .sort((a, b) => {
        if (a.path > b.path) {
          return -1;
        } else if (b.path > a.path) {
          return 1;
        }

        return 0;
      });
    work = work.then(() => files = files.concat(bundleFiles));

    if (this.append.length) {
      work = work.then(() => addFilesInOrder(this, this.append, files));
    }

    return work.then(() => {
      const Concat = require('./concat-with-sourcemaps');
      let concat = new Concat(true, this.config.name, os.EOL);
      const generateHashedPath = require('./utils').generateHashedPath;
      const generateHash = require('./utils').generateHash;
      let needsSourceMap = false;

      for (let i = 0; i < files.length; ++i) {
        let currentFile = files[i];
        let sourceMapEnabled = buildOptions.isApplicable('sourcemaps');
        let sourceMap = sourceMapEnabled ? currentFile.sourceMap : undefined;

        function fileIsDependency(file) {
          return file
            && file.path
            && file.path.indexOf('node_modules') >= 0;
        }

        function acquireSourceMapForDependency(file) {
          if (!file || !file.path) {
            return;
          }

          let parsedPath = path.parse(file.path);

          try {
            let base64SourceMap = Convert.fromSource(file.contents.toString());

            if (base64SourceMap) {
              return null;
            }
          } catch (error) {
            // we don't want the build to fail when a sourcemap file can't be parsed
            return null;
          }

          let converter;

          try {
            converter = Convert.fromMapFileSource(file.contents.toString(), parsedPath.dir);
          } catch (e) {
            console.log(e);
            return null;
          }

          sourceMap = converter
            ? converter.sourcemap
            : null;

          if (sourceMap !== null) {
            let sourceRoot = parsedPath.dir.substring(process.cwd().length);
            sourceMap.sourceRoot = sourceRoot.replace(/\\/g, '\/');
          }

          return sourceMap;
        }

        let content = currentFile.contents;

        if (sourceMapEnabled) {
          if (fileIsDependency(currentFile)) {
            sourceMap = acquireSourceMapForDependency(currentFile);
          }

          if (sourceMap) {
            needsSourceMap = true;
            content = Convert.removeMapFileComments(currentFile.contents);
          }
        }
        concat.add(currentFile.path, content, sourceMap ? JSON.stringify(sourceMap) : undefined);
      }

      let mapContents;
      let contents = concat.content;
      let bundleFileName = this.config.name;

      if (loaderOptions.configTarget === this.config.name) {
        //Add to the config bundle the loader config. Can't change index.html yet because we haven't generated hashes for all the files
        concat.add(undefined, this.writeLoaderCode(platform));
        contents = concat.content;

        if (buildOptions.isApplicable('rev')) {
          //Generate a unique hash based off of the bundle contents
          //Must generate hash after we write the loader config so that any other bundle changes (hash changes) can cause a new hash for the vendor file
          this.hash = generateHash(concat.content);
          bundleFileName = generateHashedPath(this.config.name, this.hash);
        }

        //Again, in the config setup, we're at the last bundle, and we can modify the index.html correctly now
        let outputDir = platform.baseUrl || platform.output; //If we have a baseUrl, then the files are served from there, else it's the output
        if (platform.index) {
          this.setIndexFileConfigTarget(platform, path.posix.join(outputDir, bundleFileName));
        }
      } else if (buildOptions.isApplicable('rev')) {
        //Generate a unique hash based off of the bundle contents
        //Must generate hash after we write the loader config so that any other bundle changes (hash changes) can cause a new hash for the vendor file
        this.hash = generateHash(concat.content);
        bundleFileName = generateHashedPath(this.config.name, this.hash);
      }

      let mapFileName = bundleFileName + '.map';
      let mapSourceRoot = path.posix.relative(
        path.posix.join(process.cwd(), platform.output),
        process.cwd()
      );

      console.log(`Writing ${bundleFileName}...`);

      if (buildOptions.isApplicable('bundleReport')) {
        let sbuffer = [];
        let jsonRep = {};

        sbuffer.push('>> ' + bundleFileName + ' total size : ' + (contents.length / 1024).toFixed(2) + 'kb, containing ' + files.length + ' files');
        let sortedFiles = files.sort((a, b) => {
          if (a.contents.length > b.contents.length) {
            return -1;
          }
          if (a.contents.length < b.contents.length) {
            return 1;
          }
          return 0;
        });
        for (let i = 0; i < sortedFiles.length; ++i) {
          let currentFile = sortedFiles[i];
          sbuffer.push('> ' + (currentFile.contents.length / 1024).toFixed(2) + 'kb (' + ((currentFile.contents.length / contents.length) * 100).toFixed(2) + '%) - ' + (currentFile.path || currentFile.contents.substring(0, 200)));
          if (currentFile.path) {
            jsonRep[currentFile.path] = jsonRep[currentFile.path] || {};
            jsonRep[currentFile.path].file = currentFile.path;
            jsonRep[currentFile.path].filesize = (currentFile.contents.length / 1024).toFixed(2);
          }
        }

        logger.info(`Writing bundle reports for ${bundleFileName}...`);
        fs.writeFile(`bundle-report-${bundleFileName}.txt`, sbuffer.join('\n'));
        fs.writeFile(`bundle-report-${bundleFileName}.json`, JSON.stringify(jsonRep, null, 2));
      }

      if (buildOptions.isApplicable('minify')) {
        let UglifyJS;

        try {
          UglifyJS = require('uglify-es');
        } catch (e) {
          logger.warn(
            'uglify-es package not available: Attempting to use uglify-js.'
          );
          logger.warn(
            'Consider adding the uglify-es package to your npm dependencies ' +
            'if you intend to support ES6 code minification.'
          );

          UglifyJS = require('uglify-js');
        }

        // fromString is not a supported option in v3
        const isV3 = !!(UglifyJS.minify('', {fromString: true}).error);

        let minificationOptions = {};
        if (!isV3) minificationOptions.fromString = true;

        let minifyOptions = buildOptions.getValue('minify');
        if (typeof minifyOptions === 'object') {
          Object.assign(minificationOptions, minifyOptions);
        }

        if (needsSourceMap) {
          if (isV3) {
            minificationOptions.sourceMap = {
              content: concat.sourceMap,
              filename: bundleFileName,
              url: mapFileName,
              root: mapSourceRoot
            };
          } else {
            minificationOptions.inSourceMap = Convert.fromJSON(concat.sourceMap).toObject();
            minificationOptions.outSourceMap = mapFileName;
            minificationOptions.sourceRoot = mapSourceRoot;
          }
        }

        let minificationResult = UglifyJS.minify(String(contents), minificationOptions);
        if (minificationResult.error) throw minificationResult.error;

        contents = minificationResult.code;
        mapContents = needsSourceMap ? Convert.fromJSON(minificationResult.map).toJSON() : undefined;
      } else if (needsSourceMap) {
        mapContents = Convert.fromJSON(concat.sourceMap)
          .setProperty('sourceRoot', mapSourceRoot)
          .toJSON();

        contents += os.EOL + '//# sourceMappingURL=' + mapFileName;
      }

      return fs.writeFile(path.posix.join(platform.output, bundleFileName), contents).then(() => {
        this.requiresBuild = false;

        if (mapContents) {
          return fs.writeFile(path.posix.join(platform.output, mapFileName), mapContents)
          .catch(e => {
            logger.error(`Unable to write the sourcemap to ${path.posix.join(platform.output, mapFileName)}`);
          });
        }
      })
      .catch(e => {
        logger.error(`Unable to write the bundle to ${path.posix.join(platform.output, bundleFileName)}`);
        logger.info(e);
        throw e;
      });
    })
    .catch(e => {
      logger.error('Failed to write the bundle');
      logger.info(e);
      throw e;
    });
  }

  getFileFromCacheOrLoad(x) {
    let found = this.fileCache[x];
    if (found) {
      return Promise.resolve(found);
    }

    return fs.readFile(x).then(data => {
      found = { contents: data.toString(), path: x };
      this.fileCache[x] = found;
      return found;
    }).catch(e => {
      logger.error(`Error while trying to read ${x}`);
      throw e;
    });
  }

  writeLoaderCode(platform) {
    const createLoaderCode = require('./loader').createLoaderCode;
    let config = createLoaderCode(platform, this.bundler);

    return 'function _aureliaConfigureModuleLoader(){' + config + '}';
  }

  setIndexFileConfigTarget(platform, location) {
    //Replace the reference to the vendor bundle in the "index.html" file to use the correct build revision file (or remove the build revision hash);
    const createSrcFileRegex = require('./utils').createSrcFileRegex;
    let indexLocation = platform.index;
    try {
      let indexFile = fs.readFileSync(indexLocation);
      let outputDir = platform.baseUrl || platform.output; //If we have a baseUrl, then the files are served from there, else it's the output
      let configMatcher = createSrcFileRegex(outputDir, this.moduleId);
      if (configMatcher.test(indexFile)) {
        indexFile = indexFile.replace(configMatcher, 'src="$2' + location + '"');//Replace the old reference to the file with whatever the new one is (preserving any unknown path parts before)
        fs.writeFile(indexLocation, indexFile);
      } else {
        logger.error('Error: Unable to update ' + this.moduleId + ' path to ' + location + ', could not find existing reference to replace');
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        logger.error('Error: No index file found at "' + indexLocation + '"');
      } else {
        logger.error(err);
      }
    }
  }
};

function addFilesInOrder(bundle, paths, files) {
  let index = -1;

  function addFile() {
    index++;

    if (index < paths.length) {
      return bundle.getFileFromCacheOrLoad(paths[index])
        .then(file => files.push(file))
        .then(addFile);
    }

    return Promise.resolve();
  }

  return addFile();
}

function unique(collection) {
  let u = {};
  let a = [];

  for (let i = 0, l = collection.length; i < l; ++i) {
    if (u.hasOwnProperty(collection[i])) {
      continue;
    }

    a.push(collection[i]);
    u[collection[i]] = 1;
  }

  return a;
}

function uniqueBy(collection, key) {
  const seen = {};
  return collection.filter((item) => {
    const k = key(item);
    return seen.hasOwnProperty(k) ? false : (seen[k] = true);
  });
}
