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
  ).addToTasks(
    ProjectItem.resource('transpile.js', 'tasks/transpile.js'),
    ProjectItem.resource('lint.js', 'tasks/lint.js')
  ).addToDevDependencies(
    'babel-eslint',
    'babel-plugin-syntax-flow',
    'babel-plugin-transform-decorators-legacy',
    'babel-plugin-transform-flow-strip-types',
    'babel-preset-env',
    'babel-preset-stage-1',
    'babel-polyfill',
    'babel-register',
    'gulp-babel',
    'gulp-eslint'
  );
};
