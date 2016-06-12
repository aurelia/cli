/*jshint evil: true, strict: false */
/*global requirejs, define */
// Using sloppy since this uses eval for some code like plugins,
// which may not be strict mode compliant. So if use strict is used
// below they will have strict rules applied and may cause an error.

var fs = require('fs'),
    lang = require('../lang'),
    parse = require('../parse'),
    path = require('path'),
    exists = fs.existsSync || path.existsSync,
    nodeRequire = require;

eval(fs.readFileSync(path.join(__dirname, 'require.js'), 'utf8'));

// Method to contain eval scope a bit for code evaluations.
function __exec(contents, r, d, c) {
  /*jshint unused: false */
  var exports, module,
      requirejs = r,
      require = r,
      define = d;
  // Used by some loader plugins. Would be good to remove long term.
  r.nodeRequire = nodeRequire;

  r._readFile = function(path) {
    return c.fileRead(undefined, path);
  };
  r._fileExists = function(path) {
    return c.fileExists(undefined, path);
  };

  eval(contents);
}

// Patch requirejs to work for build purposes.
(function() {
  var hasProp = lang.hasProp,
    falseProp = lang.falseProp,
    getOwn = lang.getOwn,
    // Used to strip out use strict from toString()'d functions for the
    // shim config since they will explicitly want to not be bound by strict,
    // but some envs, explicitly xpcshell, adds a use strict.
    useStrictRegExp = /['"]use strict['"];/g;

  var layer,
    pluginBuilderRegExp =
                    /(["']?)pluginBuilder(["']?)\s*[=\:]\s*["']([^'"\s]+)["']/,
    oldNewContext = requirejs.s.newContext,
    oldDef = define;

  function frontSlash(filePath) {
      return filePath.replace(/\\/g, '/');
  }

  function defaultExists(id, filePath) {
    return exists(filePath) && fs.statSync(filePath).isFile();
  }

  function defaultRead(context, id, filePath, encoding) {
    if (lang.hasProp(context._cachedRawText, filePath)) {
      return context._cachedRawText[filePath];
    } else {
      var text = fs.readFileSync(filePath, encoding || 'utf8');
      context._cachedRawText[filePath] = text;
      return text;
    }
  }

  function makeDefine(context) {
    // Override define() to catch modules that just define an object, so that
    // a dummy define call is not put in the build file for them. They do
    // not end up getting defined via context.execCb, so we need to catch them
    // at the define call.

    // This function signature does not have to be exact, just match what we
    // are looking for.
    var define = function (name) {
      var layer = context._layer;
      if (typeof name === 'string') {
        // Store the defined name related to the URL that loaded it.
        var loadingUrl =
                context.currentLoadingUrl[context.currentLoadingUrl.length - 1];
        if (loadingUrl) {
          var defines = context.urlToDefines[loadingUrl] ||
                        (context.urlToDefines[loadingUrl] = []);
          defines.push(name);
        }

        if (falseProp(layer.needsDefine, name)) {
          layer.modulesWithNames[name] = true;
        }
      }
      return oldDef.apply(null, arguments);
    };

    define.amd = oldDef.amd;

    return define;
  }

  // Overrides the new context call to add existing tracking features.
  requirejs.s.newContext = function (name) {
    var context = oldNewContext(name),
      oldEnable = context.enable,
      moduleProto = context.Module.prototype,
      oldInit = moduleProto.init,
      oldCallPlugin = moduleProto.callPlugin;

    layer = context._layer = {
      buildPathMap: {},
      buildFileToModule: {},
      buildFilePaths: [],
      pathAdded: {},
      modulesWithNames: {},
      needsDefine: {},
      existingRequireUrl: '',
      ignoredUrls: {},
      context: context
    };

    context.needFullExec = {};
    context.fullExec = {};
    context.plugins = {};
    context.buildShimExports = {};

    context.currentLoadingUrl = [];
    context.urlToDefines = {};
    context.depsForId = {};
    context.dependentsForId = {};

    // Stored raw text caches, used by browser use.
    context._cachedRawText = {};
    // Stored cached file contents for reuse in other layers.
    context._cachedFileContents = {};
    // Store which cached files contain a require definition.
    context._cachedDefinesRequireUrls = {};

    // Stores the _options.readTransform contents for use in top level results.
    context._readTransformedContents = {};

    // For tracing, do everything sync so that build runs are more reproducible.
    // Otherwise, async IO could lead to differing results.
    context.nextTick = function (fn) {
      fn();
    };

    context.normalizePath = function(filePath) {
      var rootDir = context.config._options && context.config._options.rootDir;

      // If path starts with a slash or has a colon in it, then already
      // considered a full path without needing rootDir.
      if (rootDir &&
          filePath.indexOf('/') !== 0 &&
          filePath.indexOf(':') === -1) {
        filePath = path.join(rootDir, filePath);
      }
      filePath = frontSlash(path.normalize(filePath));
      return filePath;
    };

    var oldNameToUrl = context.nameToUrl;
    context.nameToUrl = function (moduleName, ext, skipExt) {
      var url = oldNameToUrl.call(context, moduleName, ext, skipExt);
      return context.normalizePath(url);
    };

    context._setToolOptions = function(options) {
      context.config._options = options;

      // Caching function for performance.
      var contextRead = defaultRead.bind(null, context);
      if (context.config._options.fileRead) {
        var optionRead = context.config._options.fileRead;
        context.fileRead = function(id, filePath, encoding) {
          return optionRead(contextRead, id, filePath, encoding);
        };

        var optionExists = context.config._options.fileExists;
        context.fileExists = function(id, filePath) {
          return optionExists(defaultExists, id, filePath);
        };
      } else {
        context.fileRead = contextRead;
        context.fileExists = defaultExists;
      }
    };

    // Called by output of the parse() function, when a file does not
    // explicitly call define, probably just require, but the parse()
    // function normalizes on define() for dependency mapping and file
    // ordering works correctly.
    context.require.needsDefine = function (moduleName) {
      context._layer.needsDefine[moduleName] = true;
    };

    context._isSupportedBuildUrl = function (url) {
      var layer = context._layer;
      // Ignore URLs with protocols, hosts or question marks, means either
      // network access is needed to fetch it or it is too dynamic. Note that
      // on Windows, full paths are used for some urls, which include
      // the drive, like c:/something, so need to test for something other
      // than just a colon.
      if (url.indexOf('://') === -1 && url.indexOf('?') === -1 &&
          url.indexOf('empty:') !== 0 && url.indexOf('//') !== 0) {
        return true;
      } else {
        if (!layer.ignoredUrls[url]) {
          if (url.indexOf('empty:') === -1) {
            var logger = context.config._options.logger;
            if (logger && logger.warn) {
              logger.warn('Cannot optimize network URL, skipping: ' + url);
            }
          }
          layer.ignoredUrls[url] = true;
        }
        return false;
      }
    };

    // Override the shim exports function generator to just
    // spit out strings that can be used in the stringified
    // build output.
    context.makeShimExports = function (value) {
      var fn;
      if (context.config._options.wrapShim) {
        fn = function () {
          var str = 'return ';
          // If specifies an export that is just a global
          // name, no dot for a `this.` and such, then also
          // attach to the global, for `var a = {}` files
          // where the function closure would hide that from
          // the global object.
          if (value.exports && value.exports.indexOf('.') === -1) {
            str += 'root.' + value.exports + ' = ';
          }

          if (value.init) {
            str += '(' + value.init.toString()
                 .replace(useStrictRegExp, '') + '.apply(this, arguments))';
          }
          if (value.init && value.exports) {
            str += ' || ';
          }
          if (value.exports) {
            str += value.exports;
          }
          str += ';';
          return str;
        };
      } else {
        fn = function () {
          return '(function (global) {\n' +
            '  return function () {\n' +
            '    var ret, fn;\n' +
            (value.init ?
                ('     fn = ' + value.init.toString()
                .replace(useStrictRegExp, '') + ';\n' +
                '    ret = fn.apply(global, arguments);\n') : '') +
            (value.exports ?
                '    return ret || global.' + value.exports + ';\n' :
                '    return ret;\n') +
            '  };\n' +
            '}(this))';
        };
      }

      return fn;
    };

    context.enable = function (depMap, parent) {
      var id = depMap.id,
        parentId = parent && parent.map.id,
        needFullExec = context.needFullExec,
        fullExec = context.fullExec,
        mod = getOwn(context.registry, id);

      if (mod && !mod.defined) {
        if (parentId && getOwn(needFullExec, parentId)) {
          needFullExec[id] = depMap;
        }

      } else if ((getOwn(needFullExec, id) && falseProp(fullExec, id)) ||
             (parentId && getOwn(needFullExec, parentId) &&
            falseProp(fullExec, id))) {
        context.require.undef(id);
      }

      return oldEnable.apply(context, arguments);
    };

    // Override load so that the file paths can be collected.
    context.load = function (moduleName, url) {
      /*jslint evil: true */
      var contents, pluginBuilderMatch, builderName,
        shim, shimExports,
        currentLoadingUrl = context.currentLoadingUrl;

      // If this module is no longer in the registry, because it was undefined,
      // then do not bother doing the work.
      if (falseProp(context.registry, moduleName)) {
        return;
      }

      // Given the async nature of the rest of these steps, the full load
      // may be canceled in the middle of these steps if the module needs to
      // be undef()'d and re-evaluated in full as a loader plugin dependency.
      // So need a way to indicate this to the logic below, so it can stop
      // processing if this specific load was canceled.
      var loadStatus = {
        canceled: false
      };
      context.registry[moduleName]._loadStatus = loadStatus;

      var layer = context._layer;

      // Do not mark the url as fetched if it is
      // not an empty: URL, used by the optimizer.
      // In that case we need to be sure to call
      // load() for each module that is mapped to
      // empty: so that dependencies are satisfied
      // correctly.
      if (url.indexOf('empty:') === 0) {
        delete context.urlFetched[url];
      }

      // Only handle urls that can be inlined, so that means avoiding some
      // URLs like ones that require network access or may be too dynamic,
      // like JSONP
      if (context._isSupportedBuildUrl(url)) {

        // Save the module name to path  and path to module name mappings.
        layer.buildPathMap[moduleName] = url;
        layer.buildFileToModule[url] = moduleName;

        if (hasProp(context.plugins, moduleName)) {
          // plugins need to have their source evaled as-is.
          context.needFullExec[moduleName] = true;
        }

        if (hasProp(context._cachedFileContents, url) &&
            (falseProp(context.needFullExec, moduleName) ||
            getOwn(context.fullExec, moduleName))) {
          contents = context._cachedFileContents[url];

          // If it defines require, mark it so it can be hoisted.
          // Done here and in the else below, before the
          // else block removes code from the contents.
          // Related to #263
          if (!layer.existingRequireUrl &&
              context._cachedDefinesRequireUrls[url]) {
            layer.existingRequireUrl = url;
          }
        } else {
          // Load the file contents, process for conditionals, then
          // evaluate it.
          contents = context.fileRead(moduleName, url);

          if (context.config._options.readTransform) {
            contents = context.config._options
                       .readTransform(moduleName, url, contents);
          }

          if (context.config._options.includeContents) {
            context._readTransformedContents[url] = contents;
          }

          // Find out if the file contains a require() definition. Need to
          // know this so we can inject plugins right after it, but before
          // they are needed, and to make sure this file is first, so that
          // define calls work.
          try {
            if (!layer.existingRequireUrl &&
                parse.definesRequire(url, contents)) {
              layer.existingRequireUrl = url;
              context._cachedDefinesRequireUrls[url] = true;
            }
          } catch (e1) {
            throw new Error('Parse error using esprima ' +
                    'for file: ' + url + '\n' + e1);
          }

          if (hasProp(context.plugins, moduleName)) {
            // This is a loader plugin, check to see if it has a build
            // extension, otherwise the plugin will act as the plugin
            // builder too.
            pluginBuilderMatch = pluginBuilderRegExp.exec(contents);
            if (pluginBuilderMatch) {
              // Load the plugin builder for the plugin contents.
              builderName = context.makeModuleMap(pluginBuilderMatch[3],
                                context.makeModuleMap(moduleName),
                                null,
                                true).id;
              contents = context.fileRead(builderName,
                                          context.nameToUrl(builderName));
            }
          }

          // Parse out the require and define calls.
          // Do this even for plugins in case they have their own
          // dependencies that may be separate to how the pluginBuilder
          // works.
          try {
            if (falseProp(context.needFullExec, moduleName)) {
              contents = parse(moduleName, url, contents, {
                insertNeedsDefine: true,
                has: context.config.has,
                findNestedDependencies:
                              context.config._options.findNestedDependencies
              });
            }
          } catch (e2) {
            throw new Error('Parse error using esprima ' +
                    'for file: ' + url + '\n' + e2);
          }

          context._cachedFileContents[url] = contents;
        }

        // Track current URL for loading, so that modules in the URL can be
        // traced back to the URL. Useful for when there are multiple modules
        // in a file.
        currentLoadingUrl.push(url);

        if (contents) {
          __exec(contents, context.require, makeDefine(context), context);
        }

        var lastUrl = currentLoadingUrl[currentLoadingUrl.length - 1];
        if (url === lastUrl) {
          currentLoadingUrl.pop();
        } else {
          // If this is not a match, need to know, likely need to do fixes
          // somewhere.
          throw new Error('Unexpected currentLoadingUrl: expected ' + url +
                          ' but found ' + lastUrl);
        }

        try {
          // If have a string shim config, and this is
          // a fully executed module, try to see if
          // it created a variable in this eval scope
          if (getOwn(context.needFullExec, moduleName)) {
            shim = getOwn(context.config.shim, moduleName);
            if (shim && shim.exports) {
              shimExports = __exec(shim.exports,
                                   context.require,
                                   makeDefine(context),
                                   context);
              if (typeof shimExports !== 'undefined') {
                context.buildShimExports[moduleName] = shimExports;
              }
            }
          }

          if (loadStatus.canceled) {
            return;
          }

          // Need to close out completion of this module
          // so that listeners will get notified that it is available.
          context.completeLoad(moduleName);
        } catch (e) {
          // Track which module could not complete loading.
          if (!e.moduleTree) {
            e.moduleTree = [];
          }
          e.moduleTree.push(moduleName);

          if (!e.fileName) {
            e.fileName = url;
          }

          var mod = context.registry[moduleName];
          if (mod) {
            mod.emit('error', e);
          } else {
            var logger = context.config._options.logger;
            if (logger && logger.error) {
              logger.error('Error loading: ' + url + ': ' + e);
            }
          }
        }
      } else {
        // With unsupported URLs still need to call completeLoad to
        // finish loading.
        context.completeLoad(moduleName);
      }
    };

    // Marks module has having a name, and optionally executes the
    // callback, but only if it meets certain criteria.
    context.execCb = function (name, cb, args, exports) {
      var layer = context._layer;
      var buildShimExports = getOwn(layer.context.buildShimExports, name);

      if (buildShimExports) {
        return buildShimExports;
      } else if (cb.__requireJsBuild ||
                 getOwn(layer.context.needFullExec, name)) {
        return cb.apply(exports, args);
      }
      return undefined;
    };

    // Override undef to set _loadStatus to canceled when undefined.
    var oldUndef = context.require.undef;
    context.require.undef = function(id) {
      var mod = context.registry[id];
      if (mod && mod._loadStatus) {
        mod._loadStatus.canceled = true;
      }
      return oldUndef.call(context.require, id);
    };

    moduleProto.init = function (depMaps) {
      if (context.needFullExec[this.map.id]) {
        lang.each(depMaps, lang.bind(this, function (depMap) {
          if (typeof depMap === 'string') {
            depMap = context.makeModuleMap(depMap,
                     (this.map.isDefine ? this.map : this.map.parentMap));
          }

          if (!context.fullExec[depMap.id]) {
            context.require.undef(depMap.id);
          }
        }));
      }

      return oldInit.apply(this, arguments);
    };

    moduleProto.callPlugin = function () {
      var map = this.map,
        pluginMap = context.makeModuleMap(map.prefix),
        pluginId = pluginMap.id,
        pluginMod = getOwn(context.registry, pluginId);

      context.plugins[pluginId] = true;
      context.needFullExec[pluginId] = map;

      // If the module is not waiting to finish being defined,
      // undef it and start over, to get full execution.
      if (falseProp(context.fullExec, pluginId) &&
          (!pluginMod || pluginMod.defined)) {
        context.require.undef(pluginMap.id);
      }

      return oldCallPlugin.apply(this, arguments);
    };

    return context;
  };

  if (!requirejs.onResourceLoad) {
    // Called when execManager runs for a dependency. Used to figure out
    // what order of execution.
    requirejs.onResourceLoad = function (context, map, depMaps) {
      var id = map.id,
          layer = context._layer,
          url;

      // A loader plugin resource is dependent on the plugin.
      if (map.prefix) {
        var pluginDependents = context.dependentsForId[map.prefix] ||
                               (context.dependentsForId[map.prefix] = []);
        if (pluginDependents.indexOf(id) === -1) {
          pluginDependents.push(id);
        }
      }

      var deps = depMaps.map(function(depMap) {
        var depId = depMap.id;
        // Track dependents
        var dependents = context.dependentsForId[depId] ||
                         (context.dependentsForId[depId] = []);
        if (dependents.indexOf(id) === -1) {
          dependents.push(id);
        }

        return depId;
      });

      if (deps.length) {
        context.depsForId[id] = deps;
      }

      // Fix up any maps that need to be normalized as part of the fullExec
      // plumbing for plugins to participate in the build.
      if (context.plugins && lang.hasProp(context.plugins, id)) {
        lang.eachProp(context.needFullExec, function(value, prop) {
          // For plugin entries themselves, they do not have a map
          // value in needFullExec, just a "true" entry.
          if (value !== true && value.prefix === id && value.unnormalized) {
            var map = context.makeModuleMap(value.originalName,
                                            value.parentMap);
            context.needFullExec[map.id] = map;
          }
        });
      }

      // If build needed a full execution, indicate it
      // has been done now. But only do it if the context is tracking
      // that. Only valid for the context used in a build, not for
      // other contexts being run, like for useLib, plain requirejs
      // use in node/rhino.
      if (context.needFullExec && getOwn(context.needFullExec, id)) {
        context.fullExec[id] = map;
      }

      // A plugin.
      if (map.prefix) {
        if (falseProp(layer.pathAdded, id)) {
          layer.buildFilePaths.push(id);
          // For plugins the real path is not knowable, use the name
          // for both module to file and file to module mappings.
          layer.buildPathMap[id] = id;
          layer.buildFileToModule[id] = id;
          layer.modulesWithNames[id] = true;
          layer.pathAdded[id] = true;
        }
      } else if (map.url && context._isSupportedBuildUrl(map.url)) {
        // If the url has not been added to the layer yet, and it
        // is from an actual file that was loaded, add it now.
        url = map.url;
        if (!layer.pathAdded[url] && getOwn(layer.buildPathMap, id)) {
          // Remember the list of dependencies for this layer.
          layer.buildFilePaths.push(url);
          layer.pathAdded[url] = true;
        }
      }
    };
  }

  var idCounter = 0;

  function Loader(options) {
    var id;
    while (!id) {
      id = 'context' + (idCounter++);
      if (hasProp(requirejs.s.contexts, id)) {
        id = null;
      }
    }

    this.id = id;
    this.require = requirejs.config({
      context: id,
      // isBuild is used by loader plugins.
      isBuild: true,
      // Legacy setting from r.js, allows text loader plugin to work without
      // extra config. Can be overridden by consumers via another
      // config call. Ideally just move this out as something to explicitly
      // pass in.
      inlineText: true
    });


    this.getContext()._setToolOptions(options || {});
  }

  Loader.prototype = {
    getContext: function() {
      return requirejs.s.contexts[this.id];
    },
    discard: function() {
      delete requirejs.s.contexts[this.id];
    }
  };

  module.exports = Loader;
}());
