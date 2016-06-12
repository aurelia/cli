"use strict";
const path = require('path');
const os = require('os');
const Concat = require('./concat-with-sourcemaps');
const Convert = require('./convert-source-map');
const fs = require('../file-system');
const SourceInclusion = require('./source-inclusion').SourceInclusion;
const DependencyInclusion = require('./dependency-inclusion').DependencyInclusion;

exports.Bundle = class {
  constructor(bundler, config) {
    this.bundler = bundler;
    this.config = config;
    this.dependencies = [];
    this.moduleId = config.name.replace(path.extname(config.name), '');
    this.includes = (config.source || []).map(x => new SourceInclusion(this, x));
    this.buildOptions = bundler.interpretBuildOptions(config.options, bundler.buildOptions);
    this.requiresBuild = true;
  }

  static create(bundler, config) {
    let bundle = new Bundle(bundler, config);
    let dependencies = config.dependencies || [];

    return Promise.all(
      dependencies.map(dependency => bundler.configureDependency(dependency)
        .then(description => bundle.addDependency(description)))
    ).then(() => bundle);
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
      return Promise.all(this.includes.map(x => x.transform()));
    }

    return Promise.resolve();
  }

  getBundledModuleIds() {
    return unique(this.includes.reduce((a, b) => a.concat(b.getAllModuleIds()), []));
  }

  getBundledFiles() {
    return this.includes.reduce((a, b) => a.concat(b.getAllFiles()), []);
  }

  write(dest) {
    if (!this.requiresBuild) {
      return Promise.resolve();
    }

    let work = Promise.resolve();
    let loaderOptions = this.bundler.loaderOptions;
    let buildOptions = this.buildOptions;
    let files = [];

    if (loaderOptions.inject === this.config.name) {
      work = fs.readFile(loaderOptions.source)
        .then(data => files.push({ contents: data.toString() }))
        .then(() => files.push({ contents: this.writeLoaderConfig(loaderOptions) }));
    }

    return work.then(() => {
      files = files.concat(this.getBundledFiles());

      if (loaderOptions.inject === this.config.name) {
        files.push({ contents: this.writeBootstrapper(loaderOptions) });
      }

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
        path.join(process.cwd(), this.bundler.project.paths.output),
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

      return fs.writeFile(path.join(dest, this.config.name), contents).then(() => {
        this.requiresBuild = false;

        if (mapContents) {
          return fs.writeFile(path.join(dest, mapFileName), mapContents);
        }
      });
    });
  }

  writeLoaderConfig(loaderOptions) {
    switch(loaderOptions.type) {
      case 'require':
        return this.createRequireJSConfig();
      default:
        throw new Error(`Loader configuration style ${loaderOptions.type} is not supported.`);
    }
  }

  writeBootstrapper(loaderOptions) {
    switch(loaderOptions.type) {
      case 'require':
        return '';
        //return 'require(["aurelia-bootstrapper"]);';
      default:
        throw new Error(`Bootstrapper configuration style ${loaderOptions.type} is not supported.`);
    }
  }

  createRequireJSConfig() {
    let bundler = this.bundler;
    let loaderOptions = bundler.loaderOptions;
    let loaderConfig = bundler.loaderConfig;
    let bundles = bundler.bundles;
    let name = this.config.name;

    let config = Object.assign({
      bundles: {}
    }, loaderConfig);

    for (let i = 0; i < bundles.length; ++i) {
      let currentBundle = bundles[i];
      let currentName = currentBundle.config.name;

      if (currentName === name) {
        continue;
      }

      config.bundles[currentBundle.moduleId] = currentBundle.getBundledModuleIds();
      config.paths[currentBundle.moduleId] = '../' + bundler.project.paths.output + '/' + currentBundle.moduleId;
    }

    return 'requirejs.config(' + JSON.stringify(config) + ');'
  }
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
