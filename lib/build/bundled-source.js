const path = require('path');
const findDeps = require('./find-deps').findDeps;
const cjsTransform = require('./amodro-trace/read/cjs');
const esTransform = require('./amodro-trace/read/es');
const allWriteTransforms = require('./amodro-trace/write/all');
const Utils = require('./utils');
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

  _getUseCache() {
    return this.bundler.buildOptions.isApplicable('cache');
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
      moduleId = moduleId.slice(0, -3);
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

    if (path.extname(modulePath).toLowerCase() === '.json') {
      // support text! prefix
      let contents = `define('${Utils.moduleIdWithPlugin(moduleId, 'text', loaderType)}',[],function(){return ${JSON.stringify(this.contents)};});\n`;
      // support Node.js's json module
      contents += `define('${moduleId}',['${Utils.moduleIdWithPlugin(moduleId, 'text', loaderType)}'],function(m){return JSON.parse(m);});\n`;
      // be nice to requirejs json plugin users, add json! prefix
      contents += `define('${Utils.moduleIdWithPlugin(moduleId, 'json', loaderType)}',['${moduleId}'],function(m){return m;});\n`;
      this.contents = contents;
    } else if (matchingPlugin) {
      deps = findDeps(modulePath, this.contents, loaderType);
      this.contents = matchingPlugin.transform(moduleId, modulePath, this.contents);
    } else {
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

      const opts = {
        stubModules: loaderConfig.stubModules,
        wrapShim: wrapShim || loaderConfig.wrapShim,
        replacement: replacement
      };

      // Use cache for js files to avoid expensive parsing and transform.
      let cache;
      let hash;
      const useCache = this._getUseCache();
      if (useCache) {
        // Only hash on moduleId, opts and contents.
        // This ensures cache on npm packages can be shared
        // among different apps.
        const key = [
          moduleId,
          loaderType,
          JSON.stringify(context),
          JSON.stringify(opts),
          this.contents // contents here is after gulp transpile task
        ].join('|');
        hash = Utils.generateHash(key);
        cache = Utils.getCache(hash);
      }

      if (cache) {
        this.contents = cache.contents;
        deps = cache.deps;
      } else {
        let contents;
        // forceCjsWrap bypasses a r.js parse bug.
        // See lib/amodro-trace/read/cjs.js for more info.
        let forceCjsWrap = !!modulePath.match(/(\/|\\)(cjs|commonjs)(\/|\\)/i) ||
          // core-js uses "var define = ..." everywhere, we need to force cjs
          // before we can switch to dumberjs bundler
          (desc && desc.name === 'core-js');

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

        const writeTransform = allWriteTransforms(opts);
        contents = writeTransform(context, moduleId, modulePath, contents);

        const tracedDeps = findDeps(modulePath, contents, loaderType);
        if (tracedDeps && tracedDeps.length) {
          deps.push.apply(deps, tracedDeps);
        }
        if (deps) {
          let needsCssInjection = false;

          (new Set(deps)).forEach(dep => {
            // ignore module with plugin prefix/subfix
            if (dep.indexOf('!') !== -1) return;
            // only check css file
            if (path.extname(dep).toLowerCase() !== '.css') return;

            needsCssInjection = true;
            dep = absoluteModuleId(moduleId, dep);
            // inject css to document head
            contents += `\ndefine('${dep}',['__inject_css__','${Utils.moduleIdWithPlugin(dep, 'text', loaderType)}'],function(i,c){i(c,'_au_css:${dep}');});\n`;
          });

          if (needsCssInjection) deps.push('__inject_css__');
        }

        this.contents = contents;

        // write cache
        if (useCache && hash) {
          Utils.setCache(hash, {
            deps: deps,
            contents: this.contents
          });
        }
      }
    }

    this.requiresTransform = false;
    if (!deps || deps.length === 0) return;

    let needed = new Set();

    Array.from(new Set(deps)) // unique
      .map(d => {
        const loc = d.indexOf('!');
        if (loc < 1 || loc === d.length - 1) return d;

        let pluginName = d.slice(0, loc);
        let dep = d.slice(loc + 1);

        if (loaderType === 'system') {
          [pluginName, dep] = [dep, pluginName];
        }
        if (pluginName !== 'text' && pluginName !== 'json') {
          needed.add(pluginName);
        }
        return dep;
      })
      .filter(d => {
        // any dep requested by a npm package file
        if (this.dependencyInclusion) return true;
        // For local src, pick up all absolute dep.
        if (d[0] !== '.') return true;
        // For relative dep, as we bundled all of local js/html/css files,
        // only pick up unknown ext that might be missed by gulp tasks.
        return Utils.couldMissGulpPreprocess(d);
      })
      .map(d => absoluteModuleId(moduleId, d))
      .forEach(d => {
        // ignore false replacment
        if (browserReplacement && browserReplacement.hasOwnProperty(d)) {
          if (browserReplacement[d] === false) {
            return;
          }
        }
        needed.add(d);
      });

    return Array.from(needed);
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
        fromId: toDotDot(key + _moduleId.slice(target.length)),
        toId: toDotDot(moduleId)
      };
    }
  }
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
