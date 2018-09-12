'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.model.transpiler.options = {
    'plugins': [
      'transform-es2015-modules-amd'
    ]
  };

  project.addToContent(
    ProjectItem.resource('.eslintrc.json', 'content/eslintrc.json'),
    ProjectItem.resource('.babelrc.js', 'content/babelrc.js'),
    ProjectItem.resource('.babelrc', 'content/babelrc')
  ).addToDevDependencies(
    'babel-eslint@7.2.3',
    'eslint@3.19.0',
    'babel-loader',
    'babel-core',
    'babel-plugin-syntax-flow',
    'babel-plugin-transform-decorators-legacy',
    'babel-plugin-transform-flow-strip-types',
    'babel-polyfill',
    'babel-preset-env',
    'babel-preset-stage-1',
    'babel-register',
    'babel-plugin-istanbul'
  );
};
