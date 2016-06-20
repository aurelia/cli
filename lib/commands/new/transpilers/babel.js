"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.model.transpiler.options = {
    "plugins": [
      "transform-es2015-modules-amd"
    ]
  };

  project.addToContent(
    ProjectItem.resource('.eslintrc.json', 'content/eslintrc.json'),
    ProjectItem.resource('.babelrc', 'content/babelrc')
  ).addToTasks(
    ProjectItem.resource('transpile.js', 'tasks/transpile.js')
  ).addToDevDependencies(
    'babel-eslint',
    'babel-plugin-syntax-flow',
    'babel-plugin-transform-decorators-legacy',
    'babel-plugin-transform-es2015-modules-amd',
    'babel-plugin-transform-es2015-modules-commonjs',
    'babel-plugin-transform-flow-strip-types',
    'babel-preset-es2015',
    'babel-preset-es2015-loose',
    'babel-preset-stage-1',
    'babel-polyfill',
    'babel-register',
    'gulp-babel',
    'gulp-eslint'
  );
};
