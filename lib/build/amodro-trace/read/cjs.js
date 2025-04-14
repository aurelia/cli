"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cjs = cjs;
/**
 * @license Copyright (c) 2010-2015, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 */
const parse_1 = require("../lib/parse");
// modified to add forceWrap for dealing with
// nodjs dist/commonjs/*js or dist/cjs/*.js
// bypass r.js parse bug in usesCommonJs when checking
// node_modules/@aspnet/signalr/dist/cjs/IHubProtocol.js
// node_modules/@aspnet/signalr/dist/cjs/ILogger.js
// https://github.com/requirejs/r.js/issues/980
function cjs(fileName, fileContents, forceWrap) {
    // Strip out comments.
    var preamble = '', commonJsProps = parse_1.parse.usesCommonJs(fileName, fileContents);
    // First see if the module is not already RequireJS-formatted.
    if (!forceWrap && (parse_1.parse.usesAmdOrRequireJs(fileName, fileContents) || !commonJsProps)) {
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
}
;
//# sourceMappingURL=cjs.js.map