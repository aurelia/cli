"use strict";
const transform = require('@babel/core').transform;
module.exports = function es(fileName, fileContents) {
    return transform(fileContents, {
        babelrc: false,
        plugins: [['@babel/plugin-transform-modules-amd', { loose: true }]]
    }).code;
};
//# sourceMappingURL=es.js.map