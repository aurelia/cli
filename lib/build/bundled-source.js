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

    console.log(`Tracing ${moduleId}...`);

    for(let i = 0, ii = loaderPlugins.length; i < ii; ++i) {
      let current = loaderPlugins[i];

      if (current.matches(this.path)) {
        return current.transform(moduleId, this.path, this.contents).then(contents => {
          this.contents = contents;
          this.requiresTransform = false;
        });
      }
    }

    return amodroTrace(
      {
        rootDir: rootDir,
        id: moduleId,
        fileExists: function(defaultExists, id, filePath) {
          return !!bundler.getItemByPath(calculateFileName(filePath));
        },
        fileRead: function(defaultRead, id, filePath) {
          let location = calculateFileName(filePath);
          let found = bundler.getItemByPath(location);

          if (found) {
            return found.contents;
          } else {
            let contents = fs.readFileSync(location).toString();

            bundler.addFile({
              path: location,
              contents: contents
            }, that.includedBy);

            return contents;
          }
        },
        includeContents: true,
        readTransform: function(id, url, contents) {
          return cjsTransform(url, contents);
        },
        writeTransform: allWriteTransforms({
          stubModules: loaderConfig.stubModules
        })
      },
      loaderConfig
    ).then(traceResult => {
      let traced = traceResult.traced;

      for (let i = 0, ii = traced.length; i < ii; ++i) {
        let result = traceResult.traced[i];
        let item = bundler.getItemByPath(result.path);

        if (item) {
          if (item.requiresTransform) {
            item.contents = result.contents;
            item.requiresTransform = false;
            if (!item.moduleId) {
              item.moduleId = result.id;
            }
          }
        } else if (this.includedBy.traceDependencies) {
          bundler.addFile({
            path: result.path,
            contents: result.contents
          }, this.includedBy);
        }
      }
    });
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
