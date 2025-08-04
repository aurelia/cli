const transformSync = require('@babel/core').transformSync;

/**
 * Use babel to translate native es module into AMD module
 * @param {string} fileName 
 * @param {string} fileContents 
 * @param {{} | boolean} inputSourceMap 
 * @returns {{ code: string, map: string, ast: any }}
 */
module.exports = function es(fileName, fileContents, inputSourceMap) {
  return transformSync(fileContents, {
    babelrc: false,
    plugins: [['@babel/plugin-transform-modules-amd', {loose: true}]],
    inputSourceMap: inputSourceMap
  });
};
