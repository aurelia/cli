'use strict';
var lang = require('../lib/lang'),
    defines = require('./defines');

/**
 * For plugin loader resources, asks the plugins loaded in the context to write
 * out content for those values. Some plugins do not have any serialized forms
 * for their resource IDs, so the contents could still end up as an empty
 * string.
 * @param  {Object} options object for holding options. Supported options:
 * @return {Function} A function that can be used for multiple content transform
 * calls.
 */
module.exports = function plugins(options) {
  options = options || {};

  return function(context, moduleName, filePath, contents) {
    var parts = context.makeModuleMap(moduleName),
        builder = parts.prefix && lang.getOwn(context.defined, parts.prefix);

    if (builder) {
      if (builder.write) {
        var writeApi = function (input) {
          contents = input;
        };
        writeApi.asModule = function (moduleName, input) {
          contents = defines.toTransport(context, moduleName,
                                         filePath, input, options);
        };

        builder.write(parts.prefix, parts.name, writeApi);
      }
    }

    return contents;
  };
};

