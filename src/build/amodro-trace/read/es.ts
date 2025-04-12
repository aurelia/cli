const transform = require('@babel/core').transform;

// use babel to translate native es module into AMD module
module.exports = function es(fileName, fileContents) {
  return transform(fileContents, {
    babelrc: false,
    plugins: [['@babel/plugin-transform-modules-amd', {loose: true}]]
  }).code;
};
