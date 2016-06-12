'use strict';
var lang = require('../lib/lang'),
    transform = require('../lib/transform'),
    falseProp = lang.falseProp,
    getOwn = lang.getOwn,
    makeJsArrayString = lang.makeJsArrayString;

// options should include skipModuleInsertion and tracing for transform?

/**
 * For modules that are inside a package config, this transform will write out
 * adapter define() entries for the package manin value, so that package config
 * is not needed to map 'packageName' to 'packageName/mainModuleId'.
 * @param  {Object} options object for holding options. Supported options:
 * - wrapShim: if shim config is used for the module ID, then wrap it in a
 * function closure. This can be hazardous if the scripts assumes acces to
 * other variables at the top level. However, wrapping can be useful for shimmed
 * IDs that have dependencies, and where those dependencies may not be
 * immediately available or inlined with this shimmed script.
 * @return {Function} A function that can be used for multiple content transform
 * calls.
 */
function defines(options) {
  options = options || {};

  return function(context, moduleName, filePath, contents) {
    var config = context.config,
        packageName = require('./packages').getPackageName(context, moduleName);

    contents = defines.toTransport(context, moduleName,
                                   filePath, contents, options);

    //Some files may not have declared a require module, and if so,
    //put in a placeholder call so the require does not try to load them
    //after the module is processed.
    //If we have a name, but no defined module, then add in the placeholder.
    if (moduleName && falseProp(context._layer.modulesWithNames, moduleName)) {
      var shim = config.shim && (getOwn(config.shim, moduleName) ||
                 (packageName && getOwn(config.shim, packageName)));
      if (shim) {
        if (options.wrapShim) {
          contents = '(function(root) {\n' +
                         'define("' + moduleName + '", ' +
                         (shim.deps && shim.deps.length ?
                                makeJsArrayString(shim.deps) + ', ' : '[], ') +
                        'function() {\n' +
                        '  return (function() {\n' +
                             contents +
                             // Start with a \n in case last line is a comment
                             // in the contents, like a sourceURL comment.
                             '\n' + (shim.exportsFn ? shim.exportsFn() : '') +
                             '\n' +
                        '  }).apply(root, arguments);\n' +
                        '});\n' +
                        '}(this));\n';
        } else {
          contents += '\n' + 'define("' + moduleName + '", ' +
                         (shim.deps && shim.deps.length ?
                                makeJsArrayString(shim.deps) + ', ' : '') +
                         (shim.exportsFn ? shim.exportsFn() : 'function(){}') +
                         ');\n';
        }
      } else {
        contents += '\n' + 'define("' + moduleName + '", function(){});\n';
      }
    }

    return contents;
  };
}

/**
 * Modifies a define() call to make sure it has a module ID as the first
 * argument and to make sure the sugared define(function(require), {}) syntax
 * has an array of dependencies extracted and explicitly passed in, so that the
 * define() call works in JS environments that do not give the full function
 * bodies for Function.protototype.toString calls.
 * @param  {Object} context    loader context
 * @param  {String} moduleName module ID
 * @param  {String} filePath   file path
 * @param  {String} contents   contents of the file for the given module ID.
 * @param  {Object} options    object for holding options. Supported options:
 * - logger: Object of logging functions. Currently only logger.warn is used
 * if a module output for an ID cannot be properly normalized for string
 * transport.
 * @return {String}            transformed content. May not be different from
 * the input contents string.
 */
defines.toTransport = function(context, moduleName,
                               filePath, contents, options) {
  options = options || {};
  if (!options.logger) {
    options.logger = context.config._options.logger;
  }

  function onFound(info) {
    //Only mark this module as having a name if not a named module,
    //or if a named module and the name matches expectations.
    if (context && (info.needsId || info.foundId === moduleName)) {
      context._layer.modulesWithNames[moduleName] = true;
    }
  }

  return transform.toTransport('', moduleName, filePath,
                               contents, onFound, options);
};

module.exports = defines;
