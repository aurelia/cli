const transform = require('@babel/core').transform;

// use babel to translate native es module into AMD module
export = function es(fileName: string, fileContents: string) {
  return transform(fileContents, {
    babelrc: false,
    plugins: [['@babel/plugin-transform-modules-amd', {loose: true}]]
  }).code;
};
