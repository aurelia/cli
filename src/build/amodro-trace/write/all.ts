// The order of these transforms is informed by how they were done in the
// requirejs optimizer.
var transforms = [
  require('./stubs'),
  require('./defines'),
  require('./replace')
];

/**
 * Chains all the default set of transforms to return one function to be used
 * for transform operations on traced module content.
 * @param  {Object} options object for holding options. The same options object
 * is used and passed to all transforms. See individual transforms for their
 * options.
 * @return {Function} A function that can be used for multiple content transform
 * calls.
 */
module.exports = function all(options) {
  options = options || {};

  var transformFns = transforms.map(function(transform) {
    return transform(options);
  });

  return function(context, moduleName, filePath, contents) {
    contents = transformFns.reduce(function(contents, transformFn) {
      return transformFn(context, moduleName, filePath, contents);
    }, contents);

    return contents;
  };

};
