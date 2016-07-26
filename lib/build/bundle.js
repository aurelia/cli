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
    this.includes = (config.source || []).map(x => new SourceInclusion(this, x));
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
    this.includes.push(new DependencyInclusion(this, description));
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

    console.log(`Writing ${this.config.name}...`);

    let work = Promise.resolve();
    let loaderOptions = this.bundler.loaderOptions;
    let buildOptions = this.buildOptions;
    let files = [];

    if (this.prepend.length) {
      work = work.then(() => addFilesInOrder(this, this.prepend, files));
    }

    if (loaderOptions.configTarget === this.config.name) {
      work = work.then(() => {
        files.push({ contents: this.writeLoaderConfig(platform, loaderOptions) });
      });
    }

    return work.then(() => {
      files = files.concat(this.getBundledFiles());

      const Concat = require('./concat-with-sourcemaps');
      let concat = new Concat(true, this.config.name, os.EOL);
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
      let mapFileName = this.config.name + '.map';
      let mapSourceRoot = path.relative(
        path.join(process.cwd(), platform.output),
        path.join(process.cwd(), this.bundler.project.paths.root)
      );

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

      return fs.writeFile(path.join(platform.output, this.config.name), contents).then(() => {
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

  writeLoaderConfig(platform, loaderOptions) {
    switch(loaderOptions.type) {
      case 'require':
        return this.createRequireJSConfig(platform);
      default:
        throw new Error(`Loader configuration style ${loaderOptions.type} is not supported.`);
    }
  }

  createRequireJSConfig(platform) {
    let bundler = this.bundler;
    let loaderOptions = bundler.loaderOptions;
    let loaderConfig = bundler.loaderConfig;
    let bundles = bundler.bundles;
    let name = this.config.name;
    let bundleMetadata = {};
    let includeBundles = shouldIncludeBundleMetadata(bundles, loaderOptions);
    let config = Object.assign({}, loaderConfig);
    let location = platform.baseUrl || platform.output;

    if (platform.useAbsolutePath) {
      location = '/' + location;
    } else {
      location = '../' + location;
    }

    for (let i = 0; i < bundles.length; ++i) {
      let currentBundle = bundles[i];
      let currentName = currentBundle.config.name;

      if (currentName === name) {
        continue;
      }

      if (includeBundles) {
        bundleMetadata[currentBundle.moduleId] = currentBundle.getBundledModuleIds();
      }

      config.paths[currentBundle.moduleId] = location + '/' + currentBundle.moduleId;
    }

    if (includeBundles) {
      config.bundles = bundleMetadata;
    }

    return 'requirejs.config(' + JSON.stringify(config) + ');'
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
