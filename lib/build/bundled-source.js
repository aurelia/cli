'use strict';
const path = require('path');
const findDeps = require('./find-deps').findDeps;
const cjsTransform = require('./amodro-trace/read/cjs');
const esTransform = require('./amodro-trace/read/es');
const allWriteTransforms = require('./amodro-trace/write/all');
const {moduleIdWithPlugin} = require('./utils');
const logger = require('aurelia-logging').getLogger('BundledSource');

exports.BundledSource = class {
  constructor(bundler, file) {
    this.bundler = bundler;
    this.file = file;
    this.includedIn = null;
    this.includedBy = null;
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

  get dependencyInclusion() {
    // source-inclusion could be created by dependency-inclusion
    if (this.includedBy) {
      return this.includedBy.includedBy;
    }
  }

  _getProjectRoot() {
    return this.bundler.project.paths.root;
  }

  _getLoaderPlugins() {
    return this.bundler.loaderOptions.plugins;
  }

  _getLoaderType() {
    return this.bundler.loaderOptions.type;
  }

  _getLoaderConfig() {
    return this.bundler.loaderConfig;
  }

  get moduleId() {
    if (this._moduleId) return this._moduleId;

    let dependencyInclusion = this.dependencyInclusion;
    let projectRoot = this._getProjectRoot();
    let moduleId;

    if (dependencyInclusion) {
      let loaderConfig = dependencyInclusion.description.loaderConfig;
      let root = path.resolve(projectRoot, loaderConfig.path);
      moduleId = path.join(loaderConfig.name, this.path.replace(root, ''));
    } else {
      let modulePath = path.relative(projectRoot, this.path);
      moduleId = path.normalize(modulePath);
    }

    moduleId = moduleId.replace(/\\/g, '/');
    if (moduleId.toLowerCase().endsWith('.js')) {
      moduleId = moduleId.substr(0, moduleId.length - 3);
    }

    this._moduleId = toDotDot(moduleId);
    return this._moduleId;
  }

  update(file) {
    this.file = file;
    this._contents = null;
    this.requiresTransform = true;
    this.includedIn.requiresBuild = true;
  }

  transform() {
    if (!this.requiresTransform) {
      return;
    }

    let dependencyInclusion = this.dependencyInclusion;
    let browserReplacement = dependencyInclusion &&
      dependencyInclusion.description.browserReplacement();

    let loaderPlugins = this._getLoaderPlugins();
    let loaderType = this._getLoaderType();
    let loaderConfig = this._getLoaderConfig();
    let moduleId = this.moduleId;
    let modulePath = this.path;

    let shortcut = possibleShortcut(moduleId, loaderConfig.paths);
    if (shortcut) {
      this.bundler.configTargetBundle.addAlias(shortcut.fromId, shortcut.toId);
    }

    logger.debug(`Tracing ${moduleId}`);

    let deps;

    let matchingPlugin = loaderPlugins.find(p => p.matches(modulePath));

    if (matchingPlugin) {
      deps = findDeps(modulePath, this.contents);
      this.contents = matchingPlugin.transform(moduleId, modulePath, this.contents);
    } else if (path.extname(modulePath).toLowerCase() === '.json') {
      // support Node.js's json module
      let contents = `define(\'${moduleId}\',[],function(){return JSON.parse(${JSON.stringify(this.contents)});});\n`;
      // be nice to requirejs json plugin users, add json! prefix
      contents += `define(\'${moduleIdWithPlugin(moduleId, 'json', loaderType)}\',[\'${moduleId}\'],function(m){return m;});\n`;
      this.contents = contents;
    } else {
      // forceCjsWrap bypasses a r.js parse bug.
      // See lib/amodro-trace/read/cjs.js for more info.
      let forceCjsWrap = !!modulePath.match(/\/(cjs|commonjs)\//i);
      let contents;

      try {
        contents = cjsTransform(modulePath, this.contents, forceCjsWrap);
      } catch (ignore) {
        // file is not in amd/cjs format, try native es module
        try {
          contents = esTransform(modulePath, this.contents);
        } catch (e) {
          logger.error('Could not convert to AMD module, skipping ' + modulePath);
          logger.error('Error was: ' + e);
          contents = this.contents;
        }
      }

      deps = [];

      let context = {pkgsMainMap: {}, config: {shim: {}}};
      let desc = dependencyInclusion && dependencyInclusion.description;
      if (desc && desc.mainId === moduleId) {
        // main file of node package
        context.pkgsMainMap[moduleId] = desc.name;
      }

      let wrapShim = false;
      let replacement = {};
      if (dependencyInclusion) {
        let description = dependencyInclusion.description;

        if (description.loaderConfig.deps || description.loaderConfig.exports) {
          context.config.shim[description.name] = {
            deps: description.loaderConfig.deps,
            'exports': description.loaderConfig.exports
          };
        }

        if (description.loaderConfig.deps) {
          // force deps for shimed package
          deps.push.apply(deps, description.loaderConfig.deps);
        }

        if (description.loaderConfig.wrapShim) {
          wrapShim = true;
        }

        if (browserReplacement) {
          for (let i = 0, keys = Object.keys(browserReplacement); i < keys.length; i++) {
            let key = keys[i];
            let target = browserReplacement[key];

            const baseId = description.name + '/index';
            const sourceModule = key.startsWith('.') ?
              relativeModuleId(moduleId, absoluteModuleId(baseId, key)) :
              key;

            let targetModule;
            if (target) {
              targetModule = relativeModuleId(moduleId, absoluteModuleId(baseId, target));
            } else {
              // {"module-a": false}
              // replace with special placeholder __ignore__
              targetModule = '__ignore__';
            }
            replacement[sourceModule] = targetModule;
          }
        }
      }

      const writeTransform = allWriteTransforms({
        stubModules: loaderConfig.stubModules,
        wrapShim: wrapShim || loaderConfig.wrapShim,
        replacement: replacement
      });

      contents = writeTransform(context, moduleId, modulePath, contents);

      const tracedDeps = findDeps(modulePath, contents);
      if (tracedDeps && tracedDeps.length) {
        deps.push.apply(deps, tracedDeps);
      }
      this.contents = contents;
    }

    this.requiresTransform = false;

    // return deps
    if (!deps || deps.length === 0) return;

    let moduleIds = Array.from(new Set(deps)) // unique
      .map(stripPluginPrefixOrSubfix)
      // don't bother with local dependency in src,
      // as we bundled all of local js/html/css files.
      .filter(d => this.dependencyInclusion || d[0] !== '.')
      .map(d => absoluteModuleId(moduleId, d))
      .filter(d => {
        // ignore false replacment
        if (browserReplacement && browserReplacement.hasOwnProperty(d)) {
          if (browserReplacement[d] === false) {
            return false;
          }
        }
        return true;
      });

    return moduleIds;
  }
};

function possibleShortcut(moduleId, paths) {
  const _moduleId = fromDotDot(moduleId);
  for (let i = 0, keys = Object.keys(paths); i < keys.length; i++) {
    let key = keys[i];
    let target = paths[key];
    if (key === 'root') continue;
    if (key === target) continue;

    if (_moduleId.startsWith(target + '/')) {
      return {
        fromId: toDotDot(key + _moduleId.substr(target.length)),
        toId: toDotDot(moduleId)
      };
    }
  }
}

function stripPluginPrefixOrSubfix(moduleId) {
  const hasPrefix = moduleId.match(/^\w+\!(.+)$/);
  if (hasPrefix) {
    return hasPrefix[1];
  }

  const hasSubfix = moduleId.match(/^(.+)\!\w+$/);
  if (hasSubfix) {
    return hasSubfix[1];
  }

  return moduleId;
}

function absoluteModuleId(baseId, moduleId) {
  if (moduleId[0] !== '.') return moduleId;

  let parts = baseId.split('/');
  parts.pop();

  moduleId.split('/').forEach(p => {
    if (p === '.') return;
    if (p === '..') {
      parts.pop();
      return;
    }
    parts.push(p);
  });

  return parts.join('/');
}

function relativeModuleId(baseId, moduleId) {
  if (moduleId[0] === '.') return moduleId;

  let baseParts = baseId.split('/');
  baseParts.pop();

  let parts = moduleId.split('/');

  while (parts.length && baseParts.length && baseParts[0] === parts[0]) {
    baseParts.shift();
    parts.shift();
  }

  let left = baseParts.length;
  if (left === 0) {
    parts.unshift('.');
  } else {
    for (let i = 0; i < left; i ++) {
      parts.unshift('..');
    }
  }

  return parts.join('/');
}

// if moduleId is above surface (default src/), the '../../' confuses hell out of
// requirejs as it tried to understand it as a relative module id.
// replace '..' with '__dot_dot__' to enforce absolute module id.
function toDotDot(moduleId) {
  return moduleId.split('/').map(p => p === '..' ? '__dot_dot__' : p).join('/');
}

function fromDotDot(moduleId) {
  return moduleId.split('/').map(p => p === '__dot_dot__' ? '..' : p).join('/');
}
