/**
 * Replaces module content for a given set of module IDs with stub define calls.
 * @param  {Object} options object for holding options. Supported options:
 * - stubModules: Array of module IDs to place in stubs.
 * @return {Function} A function that can be used for multiple content transform
 * calls.
 */
module.exports = function stubs(options) {
  options = options || {};

  return function(context, moduleName, filePath, contents) {
    if (options.stubModules
          && (options.stubModules.indexOf(moduleName) !== -1
              || options.stubModules.indexOf(context.pkgsMainMap[moduleName]) !== -1)) {
      //Just want to insert a simple module definition instead
      //of the source module. Useful for plugins that inline
      //all their resources.
      //Slightly different content for plugins, to indicate
      //that dynamic loading will not work.
      return 'define({load: function(id){' +
             'throw new Error("Dynamic load not allowed: " + id);}});';
    } else {
      return contents;
    }
  };

};
