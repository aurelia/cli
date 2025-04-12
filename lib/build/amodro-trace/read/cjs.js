"use strict";
/**
 * @license Copyright (c) 2010-2015, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 */
const parse = require("../lib/parse");
module.exports = function cjs(fileName, fileContents, forceWrap) {
    // Strip out comments.
    var preamble = '', commonJsProps = parse.usesCommonJs(fileName, fileContents);
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
//# sourceMappingURL=cjs.js.map