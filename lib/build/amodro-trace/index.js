'use strict';
var Prom = require('./lib/prom'),
    Loader = require('./lib/loader/Loader'),
    specialDepIds = {
      require: true,
      exports: true,
      module: true
    };

/**
 * Returns the set of nested dependencies for a given module ID in the options.
 * @param  {Object} options the set of options for trace. Possible options:
 * - rootDir: String. The full path to the root of the project to be scanned.
 *   This is usually the top level directory of the project that is served to
 *   the web, and the reference directory for relative baseUrls in an AMD loader
 *   config.
 * - id: String. the module ID to trace.
 * - findNestedDependencies: Boolean. Defaults to false. Normally require([])
 *   calls inside a define()'d module are not traced, as they are usually meant
 *   to be dynamically loaded dependencies and are not static module
 *   dependencies. However, for some tracing cases it is useful to know these
 *   dynamic dependencies. Setting this option to true will do that. It only
 *   captures require([]) calls that use string literals for dependency IDs. It
 *   cannot trace dependency IDs that are variables for JS expressions.
 * - fileRead: Function. A function that synchronously returns the file contents
 *   for the given file path. Allows overriding where file contents come from,
 *   for instance, building up an in-memory map of file names and contents from
 *   a stream. Arguments passed to this function:
 *   function(defaultReadFunction, moduleName, filePath) {}
 *   Where defaultReadFunction is the default read function used. You can call
 *   it with the filePath to get the contents via the normal file methods this
 *   module uses to get file contents.
 * - fileExists: Function. If fileRead is provided, this function should be
 *   provided too. Determines if a file exists for the mechanism that reads
 *   files. A synchronous Boolean answer is expected. Signature is:
 *   function(defaultExistsFunction, moduleName, filePath) {}
 *   Where defaultExistsFunction is the default exists function used by the
 *   internals of this module.
 * - readTransform: Function. A function that is used to transform the contents
 *   of the modules after the contents are read but before they are parsed for
 *   module APIs. The function will receive these arguments:
 *   function(moduleName, filePath, contents), and should synchronously return a
 *   string that will be used as the contents.
 * - includeContents: Boolean. Set to true if the contents of the modules should
 *   be included in the output. The contents will be the contents after the
 *   readTransform function has run, if it is provided.
 * - writeTransform: Function. When contents are added to the result, run
 *   this function to allow transforming the contents. See the write/
 *   directory for example transforms. Setting this option automatically sets
 *   includeContents to be true.
 * - keepLoader: Boolean. Keep the loader instance and pass it in the return
 *   value. This is useful if transforms that depend on the instance's context
 *   will be used to transform the contents, and where writeTransform is not
 *   the right fit.
 * @param  {Object} loaderConfig the requirejs loader config to use for tracing
 * and finding modules.
 * @return {Object} The trace result.
 */
module.exports = function trace(options, loaderConfig) {
  return new Prom(function(resolve, reject) {
    // Validate the options.
    if (!options.id) {
      reject(new Error('options must include "id" ' +
                       'to know what module ID to trace'));
      return;
    }

    if (options.writeTransform) {
      options.includeContents = true;
    }

    var logger = {
      warnings: [],
      errors: [],
      warn: function(msg) {
        logger.warnings.push(msg);
      },
      error: function(msg) {
        logger.errors.push(msg);
      }
    };
    options.logger = logger;

    var loader = new Loader(options);

    if (loaderConfig) {
      loader.getContext().configure(loaderConfig);
    }

    function onOk() {
      var context = loader.getContext();

      // Pull out the list of IDs for this layer as the return value.
      var paths = context._layer.buildFilePaths,
          idMap = context._layer.buildFileToModule;

      var result = paths.map(function(filePath) {
        var id = idMap[filePath];
        // If a loader plugin, try to guess the path instead of use the ID as
        // the filePath.
        if (id.indexOf('!') !== -1) {
          var ext, modifiedName, resourcePath,
              map = context.makeModuleMap(id),
              name = map.name;

          var lastIndex = name.lastIndexOf('.');
          if (lastIndex !== -1) {
            ext = name.substring(lastIndex);
            modifiedName = name.substring(0, lastIndex);
            resourcePath = context.nameToUrl(modifiedName, ext, true);
            if (context.fileExists(id, resourcePath)) {
              filePath = resourcePath;
            } else {
              resourcePath = null;
            }
          }

          // Try to find a path that might correspond to the loader plugin by
          // looking for the following in priority order:
          // * resourceId[.extension]
          // * resourceId
          // * resourceId.pluginId.
          if (!resourcePath) {
            resourcePath = context.nameToUrl(name, '', true);
            if (context.fileExists(id, resourcePath)) {
              filePath = resourcePath;
            } else {
              resourcePath = context.nameToUrl(name, '.' + map.prefix, true);
              if (context.fileExists(id, resourcePath)) {
                filePath = resourcePath;
              } else {
                filePath = null;
              }
            }
          }
        }

        var item = {
          id: id
        };

        if (filePath) {
          item.path = filePath;
        }

        if (options.includeContents && filePath) {
          var contents = context._readTransformedContents[filePath];
          if (!contents && context.fileExists(id, filePath)) {
            contents = context.fileRead(id, filePath) || '';
            if (options.writeTransform) {
              contents = options
                         .writeTransform(context, id, filePath, contents);
            }
          }
          if (contents && options.writeTransform) {
            contents = options.writeTransform(context,
                                              id,
                                              filePath,
                                              contents);
          }

          item.contents = contents;
        }

        if (filePath) {
          var inlinedIds = context.urlToDefines[filePath];
          if (inlinedIds) {
            var otherIds;
            inlinedIds.forEach(function(inlinedId) {
              var deps = context.depsForId[inlinedId];

              // Do not include the special dependency IDs, they do not help
              // in tracing inter-module dependencies, they are meta ones that
              // are always available.
              if (deps) {
                deps = deps.filter(function(dep) {
                  return !specialDepIds.hasOwnProperty(dep);
                });
              }

              if (inlinedId === id) {
                // Matches main ID for the file, just add to root of the item.
                if (deps && deps.length) {
                  item.deps = deps;
                }
              } else {
                // Another ID in the file, add it to "otherIds".
                if (!otherIds) {
                  otherIds = {};
                }
                var idProps = otherIds[inlinedId] = {};
                if (deps && deps.length) {
                  idProps.deps = deps;
                }
                var inlinedIdDependents = context.dependentsForId[inlinedId];
                if (inlinedIdDependents) {
                  idProps.dependents = inlinedIdDependents;
                }
              }
            });
            if (otherIds) {
              item.otherIds = otherIds;
            }
          }
        }

        var dependents = context.dependentsForId[id];
        if (dependents) {
          item.dependents = dependents;
        }

        return item;
      });

      // Clean up resources used by this loader instance.
      if (!options.keepLoader) {
        loader.discard();
        loader = null;
      }

      var resolved = {
        traced: result
      };

      if (loader) {
        resolved.loader = loader;
      }

      // Return logger warnings and errors
      if (logger.warnings.length) {
        resolved.warnings = logger.warnings;
      }
      if (logger.errors.length) {
        resolved.errors = logger.errors;
      }
      // Remove logger as it was added above. longer term, clone the object
      // to avoid this.
      delete options.logger;

      // Used for updating tests when structure changes
      // console.log(JSON.stringify(resolved, null, '  '));

      resolve(resolved);
    }

    // Inform requirejs that we want this function executed when done.
    onOk.__requireJsBuild = true;

    loader.require([options.id], onOk, function(err) {
      loader.discard();
      reject(err);
    });
  });
};
