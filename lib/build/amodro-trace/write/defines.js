var lang = require('../lib/lang'),
    parse = require('../lib/parse'),
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

  return function(context, moduleName, filePath, _contents) {
    var namedModule,
        config = context.config,
        packageName = context.pkgsMainMap[moduleName];

    if (packageName === 'moment') {
      // Expose moment to global var to improve compatibility with some legacy libs.
      // It also load momentjs up immediately.
      _contents = _contents.replace(/\bdefine\((\w+)\)/, (match, factoryName) =>
        `(function(){var m=${factoryName}();if(typeof moment === 'undefined'){window.moment=m;} define(function(){return m;})})()`
      );
    }

    function onFound(info) {
      if (info.foundId) {
        namedModule = info.foundId;
      }
    }

    let contents = toTransport(context, moduleName,
                                   filePath, _contents, onFound, options);

    //Some files may not have declared a require module, and if so,
    //put in a placeholder call so the require does not try to load them
    //after the module is processed.
    //If we have a name, but no defined module, then add in the placeholder.
    if (moduleName) {
      var shim = config.shim && (getOwn(config.shim, moduleName) ||
                 (packageName && getOwn(config.shim, packageName)));


      let amdProps = parse.usesAmdOrRequireJs(filePath, contents);
      // mimic requirejs runtime behaviour,
      // if no module defined, add an empty shim
      if (!shim && contents === _contents) {
        if (!amdProps || !amdProps.define) {
          shim = { deps: [] };
        }
      } else if (shim && amdProps && amdProps.define) {
        // ignore shim for AMD/UMD
        shim = null;
      }

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
                             '\n' + exportsFn(shim.exports, true) +
                             '\n' +
                        '  }).apply(root, arguments);\n' +
                        '});\n' +
                        '}(this));\n';
        } else {
          contents += '\n' + 'define("' + moduleName + '", ' +
                         (shim.deps && shim.deps.length ?
                                makeJsArrayString(shim.deps) + ', ' : '') +
                         exportsFn(shim.exports) +
                         ');\n';
        }
      } else {
        // we don't need placeholder in aurelia-cli bundle
        // contents += '\n' + 'define("' + moduleName + '", function(){});\n';

        if (packageName && namedModule && namedModule !== packageName) {
          // for main module, if named module name doesn't match package name
          // make an alias from moduleName (not packageName) to namedModule
          contents += 'define("' + moduleName + '", ["' + namedModule + '"], function(m){return m;});\n';
        }
      }
    }

    return contents;
  };
}

function exportsFn(_exports, wrapShim) {
  if (_exports) {
    if (wrapShim) return 'return root.' + _exports + ' = ' + _exports +';';
    else return '(function (global) {\n' +
                '  return function () {\n' +
                '    return global.' + _exports + ';\n' +
                '  };\n' +
                '}(this))';
  } else {
    if (wrapShim) return '';
    return 'function(){}';
  }
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
function toTransport(context, moduleName,
                               filePath, contents, onFound, options) {
  options = options || {};
  return transform.toTransport('', moduleName, filePath,
                               contents, onFound, options);
};

module.exports = defines;
