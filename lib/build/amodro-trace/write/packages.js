'use strict';
var defines = require('./defines'),
    lang = require('../lib/lang'),
    parse = require('../lib/parse');

/**
 * For modules that are inside a package config, this transform will write out
 * adapter define() entries for the package manin value, so that package config
 * is not needed to map 'packageName' to 'packageName/mainModuleId'.
 * @param  {Object} options object for holding options. Supported options:
 * @return {Function} A function that can be used for multiple content transform
 * calls.
 */
function packages(options) {
  options = options || {};

  return function(context, moduleName, filePath, contents) {
    var hasPackageName;

    //If the moduleName is a package main, then hold on to the
    //packageName in case an adapter needs to be written.
    var packageName = packages.getPackageName(context, moduleName);

    if (packageName) {
      hasPackageName = (packageName === parse.getNamedDefine(contents));
    }

    contents = defines.toTransport(context, moduleName,
                                   filePath, contents, options);

    if (packageName && !hasPackageName) {
      contents += ';define(\'' + packageName + '\', [\'' + moduleName +
                  '\'], function (main) { return main; });\n';
    }

    return contents;
  };

}

/**
 * If the moduleName maps to a package config's main module, return the package
 * name.
 * @param  {Object} context loader context.
 * @param  {String} moduleName module ID
 * @return {String} the package name, or null if one is not found.
 */
packages.getPackageName = function(context, moduleName) {
  var config = context.config,
      pkgsMainMap = config.pkgsMainMap;

  if (!pkgsMainMap) {
    config.pkgsMainMap = pkgsMainMap = {};
    //Create a reverse lookup for packages main module IDs to their package
    //names, useful for knowing when to write out define() package main ID
    //adapters.
    lang.eachProp(context.config.pkgs, function(value, prop) {
        pkgsMainMap[value] = prop;
    });
  }

  return lang.getOwn(pkgsMainMap, moduleName) || null;
};

module.exports = packages;
