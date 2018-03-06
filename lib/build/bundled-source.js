'use strict';
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
    this._deps = null;
    this.requiresTransform = true;
  }

  get sourceMap() {
    return this.file.sourceMap;
  }

  get path() {
    return this.file.path;
  }

  set deps(deps) {
    this._deps = deps || [];
  }

  get deps() {
    return this._deps;
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
    let externalModules = bundler.loaderOptions.externalModules || {};
    let rootDir = process.cwd();
    let moduleId = this.moduleId || (this.moduleId = this.calculateModuleId(rootDir, loaderConfig));
    let that = this;
    let modulePath = this.path;

    console.log(`Tracing ${moduleId}...`);

    for (let i = 0, ii = loaderPlugins.length; i < ii; ++i) {
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
        traced: bundler.getTraced(),
        fileExists: function(defaultExists, id, filePath) {
          // always force amodro to use our fileRead func.
          // this bypasses amodro bug https://github.com/amodrojs/amodro-trace/issues/6
          return true;
        },
        fileRead: function(defaultRead, id, filePath) {
          if (id in externalModules) {
            let externalContentResult = makeModuleContent(externalModules[id], defaultRead, id, filePath);
            if (externalContentResult) {
              return externalContentResult;
            }
          }

          let location = calculateFileName(filePath);
          let found = bundler.getItemByPath(location);

          if (found) {
            // ensure to use contents before stub
            return found.contentsBeforeStub || found.contents;
          }

          let contents = '';

          try {
            contents = fs.readFileSync(location).toString();

            bundler.addFile({
              path: location,
              contents: contents
            }, that.getInclusion(location));
          } catch (e) {
            if (e.code === 'ENOENT') {
              console.log(' ------- File not found or not accessible ------');
              console.log(`| Location: ${location}`);
              console.log(`| Requested by: ${modulePath}`);
              console.log('| Is this a package? Make sure that it is configured in aurelia.json and that it is not a Node.js package');
              console.log(' -----------------------------------------------');
            } else {
              throw e;
            }
          }

          return contents;
        },
        includeContents: true,
        readTransform: function(id, url, contents) {
          return cjsTransform(url, contents);
        },
        writeTransform: allWriteTransforms({
          stubModules: loaderConfig.stubModules,
          wrapShim: loaderConfig.wrapShim
        })
      },
      loaderConfig
    ).then(traceResult => {
      let traced = traceResult.traced;
      let errors = traceResult.errors;
      let warnings = traceResult.warnings;

      if (errors) {
        for (let i = 0; i < errors.length; i++) {
          console.log(`Trace error: ${errors[i]}`);
        }
      }

      if (warnings) {
        for (let i = 0; i < warnings.length; i++) {
          console.log(`Trace warning: ${warnings[i]}`);
        }
      }

      for (let i = 0, ii = traced.length; i < ii; ++i) {
        let result = traceResult.traced[i];
        let item = bundler.getItemByPath(result.path);

        if (item) {
          item.deps = result.deps;
          if (item.requiresTransform) {
            if (loaderConfig.stubModules.indexOf(result.id) >= 0) {
              // retain contents before stub
              item.contentsBeforeStub = item.contents;
            }
            item.contents = result.contents;
            item.requiresTransform = false;
            if (!item.moduleId) {
              item.moduleId = result.id;
            }
          }
        } else if (this.includedBy.traceDependencies) {
          let newItem = bundler.addFile({
            path: result.path,
            contents: result.contents
          }, this.getInclusion(result.path));

          newItem.deps = result.deps;
        }
      }
    })
    .catch(e => {
      console.log('Error occurred while tracing');
      console.log(e);
    });
  }

  getInclusion(filePath) {
    let dir = path.dirname(path.posix.normalize(filePath).replace(/\\/g, '\/'));
    let dependencyLocations = this.bundler.getAllDependencyLocations();
    let dependencyLocation = dependencyLocations.find(x => dir.indexOf(x.location) === 0);

    if (dependencyLocation) {
      return dependencyLocation.inclusion;
    }

    return this.includedBy;
  }

  calculateModuleId(rootDir, loaderConfig) {
    if (this.file.description) {
      return this.file.description.name;
    }

    let baseUrl = loaderConfig.baseUrl;
    let modulePath = path.relative(baseUrl, this.path);

    return path.normalize(modulePath.replace(path.extname(modulePath), '')).replace(/\\/g, '\/');
  }
};

function calculateFileName(filePath) {
  if (filePath.indexOf('.') === -1) {
    return filePath + '.js';
  }

  return filePath;
}

function makeModuleContent(content, defaultRead, id, filePath) {
  if (typeof content === 'function') {
    return content(defaultRead, id, filePath);
  }
  if (Array.isArray(content)) {
    let modules = content.map(m => `'${m}'`).join(',');
    return `define([${modules}], function() { });`;
  }
}
