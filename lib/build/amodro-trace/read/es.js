"use strict";
const transformSync = require('@babel/core').transformSync;
const amdPlugin = require('@babel/plugin-transform-modules-amd');
module.exports = function es(fileName, fileContents) {
    return transformSync(fileContents, {
        babelrc: false,
        plugins: [[amdPlugin, { loose: true }]]
    }).code;
};
//# sourceMappingURL=es.js.map