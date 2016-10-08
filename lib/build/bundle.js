"use strict";
const path = require('path');
const os = require('os');
const Convert = require('./convert-source-map');
const fs = require('../file-system');
const SourceInclusion = require('./source-inclusion').SourceInclusion;
const DependencyInclusion = require('./dependency-inclusion').DependencyInclusion;

exports.Bundle = class {
  constructor(bundler, config) {
    this.Minimatch = require('minimatch').Minimatch; //nested dep of vinyl-fs
    this.bundler = bundler;
    this.config = config;
    this.dependencies = [];
    this.prepend = (config.prepend || []).filter(x => bundler.itemIncludedInBuild(x));
    this.moduleId = config.name.replace(path.extname(config.name), '');
    this.hash = '';
    this.includes = (config.source || []);
    this.excludes = [];
    if(this.includes instanceof Array){
      this.includes = this.includes.map(x => new SourceInclusion(this, x));
    } else {
      this.excludes = (this.includes.exclude || []).map(x => this.createMatcher(x));
      this.includes = this.includes.include.map(x => new SourceInclusion(this, x));
    }
    this.buildOptions = bundler.interpretBuildOptions(config.options, bundler.buildOptions);
    this.requiresBuild = true;
    this.fileCache = {};
  }

  static create(bundler, config) {
    let bundle = new exports.Bundle(bundler, config);
    let dependencies = config.dependencies || [];

    return Promise.all(
      dependencies
        .filter(x => bundler.itemIncludedInBuild(x))
        .map(dependency => bundler.configureDependency(dependency)
        .then(description => bundle.addDependency(description)))
    ).then(() => bundle);
  }

  createMatcher(pattern) {
    return new this.Minimatch(pattern);
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

  getBundledModuleIds() {
    return unique(this.includes.reduce((a, b) => a.concat(b.getAllModuleIds()), []));
  }

  getBundledFiles() {
    return this.includes.reduce((a, b) => a.concat(b.getAllFiles()), []);
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
        files.push({ contents: "_aureliaConfigureModuleLoader();"});
      });
    }

    return work.then(() => {
      files = files.concat(this.getBundledFiles());

      const Concat = require('./concat-with-sourcemaps');
      let concat = new Concat(true, this.config.name, os.EOL);
      const generateHashedPath = require('./utils').generateHashedPath;
      const generateHash = require('./utils').generateHash;
      let needsSourceMap = false;

      for (let i = 0; i < files.length; ++i) {
        let currentFile = files[i];
        let sourceMap = buildOptions.sourcemaps ? currentFile.sourceMap : undefined;

        if (sourceMap) {
          needsSourceMap = true;
        }

        concat.add(currentFile.path, currentFile.contents, sourceMap ? JSON.stringify(sourceMap) : undefined);
      }

      let mapContents;
      let contents = concat.content;
      let bundleFileName = this.config.name;

      if (buildOptions.rev) {
        //Generate a unique hash based off of the bundle contents
        this.hash = generateHash(concat.content);
        bundleFileName = generateHashedPath(this.config.name, this.hash);
      }

      if (loaderOptions.configTarget === this.config.name) {
        //Add to the config bundle the loader config and change the "index.html" to reference the appropriate config bundle
        concat.add(undefined, this.writeLoaderCode(platform));
        contents = concat.content;
        let outputDir = platform.baseUrl || platform.output; //If we have a baseUrl, then the files are served from there, else it's the output
        if (platform.index) {
          this.setIndexFileConfigTarget(platform, path.join(outputDir, bundleFileName));
        }
      }

      let mapFileName = bundleFileName + '.map';
      let mapSourceRoot = path.relative(
        path.join(process.cwd(), platform.output),
        path.join(process.cwd(), this.bundler.project.paths.root)
      );

      console.log(`Writing ${bundleFileName}...`);

      if (buildOptions.minify) {
        let minificationOptions = { fromString: true };

        if (needsSourceMap) {
          minificationOptions.inSourceMap = Convert.fromJSON(concat.sourceMap).toObject();
          minificationOptions.outSourceMap = mapFileName;
          minificationOptions.sourceRoot = mapSourceRoot;
        }

        const UglifyJS = require('uglify-js'); //added to user project devDependencies
        let minificationResult = UglifyJS.minify(String(contents), minificationOptions);

        contents = minificationResult.code;
        mapContents = needsSourceMap ? Convert.fromJSON(minificationResult.map).toJSON() : undefined;
      } else if (needsSourceMap) {
        mapContents = Convert.fromJSON(concat.sourceMap)
          .setProperty('sourceRoot', mapSourceRoot)
          .toJSON();

        contents += os.EOL + '//# sourceMappingURL=' + mapFileName;
      }

      return fs.writeFile(path.join(platform.output, bundleFileName), contents).then(() => {
        this.requiresBuild = false;

        if (mapContents) {
          return fs.writeFile(path.join(platform.output, mapFileName), mapContents);
        }
      });
    });
  }

  getFileFromCacheOrLoad(x) {
    let found = this.fileCache[x];
    if (found) {
      return Promise.resolve(found);
    }

    return fs.readFile(x).then(data => {
      found = { contents: data.toString() };
      this.fileCache[x] = found;
      return found;
    });
  }

  writeLoaderCode(platform) {
    const createLoaderCode = require('./loader').createLoaderCode;
    let config = createLoaderCode(platform, this.bundler);

    return 'function _aureliaConfigureModuleLoader(){' + config + '}'
  }
  
  setIndexFileConfigTarget(platform, location){
    //Replace the reference to the vendor bundle in the "index.html" file to use the correct build revision file (or remove the build revision hash);
    const escapeForRegex = require('./utils').escapeForRegex;
    const createSrcFileRegex = require('./utils').createSrcFileRegex;
    let indexLocation = platform.index;
    try {
      let indexFile = fs.readFileSync(indexLocation);
      let outputDir = platform.baseUrl || platform.output; //If we have a baseUrl, then the files are served from there, else it's the output
      let configMatcher = createSrcFileRegex(outputDir, this.moduleId);
      if(configMatcher.test(indexFile)){
        indexFile = indexFile.replace(configMatcher, 'src="$2' + location + '"');//Replace the old reference to the file with whatever the new one is (preserving any unknown path parts before)
        fs.writeFile(indexLocation, indexFile);
      } else {
        console.log('Error: Unable to update ' + this.moduleId + ' path to ' + location + ', could not find existing reference to replace');
      }
    } catch (err){
      if (err.code === 'ENOENT') {
        console.log('Error: No index file found at "' + indexLocation + '"');
      } else {
        console.log(err);
      }
    }
  }
}

function addFilesInOrder(bundle, paths, files) {
  let index = -1;

  function addFile() {
    index++;

    if (index < paths.length) {
      return bundle.getFileFromCacheOrLoad(paths[index])
        .then(file => files.push(file))
        .then(addFile);
    } else {
      return Promise.resolve();
    }
  }

  return addFile();
}

function shouldIncludeBundleMetadata(bundles, loaderOptions) {
  let setting = loaderOptions.includeBundleMetadataInConfig;

  if (typeof setting === 'string') {
    switch (setting.toLowerCase()) {
      case 'auto':
        return bundles.length > 1;
      case 'true':
        return true;
      default:
        return false;
    }
  }

  return setting === true;
}

function unique(collection){
  var u = {}, a = [];

  for(var i = 0, l = collection.length; i < l; ++i){
    if(u.hasOwnProperty(collection[i])) {
      continue;
    }

    a.push(collection[i]);
    u[collection[i]] = 1;
  }

  return a;
}
