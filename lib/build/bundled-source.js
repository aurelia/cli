"use strict";
const path = require('path');
const amodroTrace = require('./amodro-trace');
const cjsTransform = require('./amodro-trace/read/cjs');
const allWriteTransforms = require('./amodro-trace/write/all');
const fs = require('../file-system');

exports.BundledSource = class {
  constructor(bundler, file) {
    this.bundler = bundler;
    this.file = file;
    this.includedIn = null;
    this.includedBy = null;
    this.moduleId = null;
    this._contents = null;
    this.requiresTransform = true;
  }

  get sourceMap() {
    return this.file.sourceMap;
  }

  get path() {
    return this.file.path;
  }

  set contents(value) {
    this._contents = value;
  }

  get contents() {
    return this._contents === null
      ? (this._contents = this.file.contents.toString())
      : this._contents;
  }

  update(file) {
    this.file = file;
    this._contents = null;
    this.requiresTransform = true;
    this.includedIn.requiresBuild = true;
  }

  transform() {
    if (!this.requiresTransform) {
      return Promise.resolve();
    }

    let bundler = this.bundler;
    let loaderConfig = bundler.loaderConfig;
    let loaderPlugins = bundler.loaderOptions.plugins;
    let rootDir = process.cwd();
    let moduleId = this.moduleId || (this.moduleId = this.calculateModuleId(rootDir, loaderConfig));
    let that = this;

    let location = calculateFileName(this.path);
    console.log(`Transforming ${moduleId}...`);

    for(let i = 0, ii = loaderPlugins.length; i < ii; ++i) {
      let current = loaderPlugins[i];

      if (current.matches(this.path)) {
        return current.transform(moduleId, this.path, this.contents).then(contents => {
          this.contents = contents;
          this.requiresTransform = false;
        });
      }
    }

    let contents = this.contents;
    if (!contents) {
      throw new Erorr('no content');
    }

    contents = cjsTransform(location, contents);

    const transform = allWriteTransforms({
      logger: console,
      stubModules: loaderConfig.stubModules
    });

    this.contents = transform(bundler.requirejsContext, moduleId, location, contents);
    this.requiresTransform = false;
    return Promise.resolve();
  }

  calculateModuleId(rootDir, loaderConfig) {
    if (this.file.description) {
      return this.file.description.name;
    }

    let baseUrl = loaderConfig.baseUrl;
    let modulePath = path.relative(baseUrl, this.path);

    return path.normalize(modulePath.replace(path.extname(modulePath), '')).replace(/\\/g,'\/');
  }
}

function calculateFileName(filePath) {
  if (filePath.indexOf('.') === -1) {
    return filePath + '.js';
  }

  return filePath;
}
