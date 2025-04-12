"use strict";
// The order of these transforms is informed by how they were done in the
// requirejs optimizer.
const stubs_1 = require("./stubs");
const defines = require("./defines");
const replace_1 = require("./replace");
var transforms = [stubs_1.stubs, defines, replace_1.replace];
module.exports = function all(options) {
    options = options || {};
    var transformFns = transforms.map(function (transform) {
        return transform(options);
    });
    return function (context, moduleName, filePath, contents) {
        contents = transformFns.reduce(function (contents, transformFn) {
            return transformFn(context, moduleName, filePath, contents);
        }, contents);
        return contents;
    };
};
//# sourceMappingURL=all.js.map