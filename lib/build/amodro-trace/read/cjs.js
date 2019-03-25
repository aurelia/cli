/**
 * @license Copyright (c) 2010-2015, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 */
var parse = require('../lib/parse');

// modified to add forceWrap for dealing with
// nodjs dist/commonjs/*js or dist/cjs/*.js
// bypass r.js parse bug in usesCommonJs when checking
// node_modules/@aspnet/signalr/dist/cjs/IHubProtocol.js
// node_modules/@aspnet/signalr/dist/cjs/ILogger.js
// https://github.com/requirejs/r.js/issues/980
module.exports = function cjs(fileName, fileContents, forceWrap) {
  // Strip out comments.
  var preamble = '',
  commonJsProps = parse.usesCommonJs(fileName, fileContents);

  // First see if the module is not already RequireJS-formatted.
  if (!forceWrap && (parse.usesAmdOrRequireJs(fileName, fileContents) || !commonJsProps)) {
    return fileContents;
  }

  if (commonJsProps && (commonJsProps.dirname || commonJsProps.filename)) {
    preamble = 'var __filename = module.uri || \'\', ' +
      '__dirname = ' +
      '__filename.slice(0, __filename.lastIndexOf(\'/\') + 1); ';
  }

  // Construct the wrapper boilerplate.
  return 'define(function (require, exports, module) {' +
  preamble +
  fileContents +
  '\n});\n';
};
