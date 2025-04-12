const transformSync = require('@babel/core').transformSync;
const amdPlugin = require('@babel/plugin-transform-modules-amd');

// use babel to translate native es module into AMD module
export = function es(fileName: string, fileContents: string) {
  return transformSync(fileContents, {
    babelrc: false,
    plugins: [[amdPlugin, {loose: true}]]
  }).code;
};
