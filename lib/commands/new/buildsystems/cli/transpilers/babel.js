'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.model.transpiler.options = {
    'plugins': [
      ['@babel/plugin-transform-modules-amd', {loose: true}]
    ]
  };

  project.addToContent(
    ProjectItem.resource('.eslintrc.json', 'content/eslintrc.json'),
    ProjectItem.resource('.babelrc.js', 'content/babelrc.js')
  ).addToTasks(
    ProjectItem.resource('transpile.js', 'tasks/transpile.js'),
    ProjectItem.resource('lint.js', 'tasks/lint.js')
  ).addToDevDependencies(
    'babel-eslint',
    '@babel/plugin-proposal-decorators',
    '@babel/plugin-proposal-class-properties',
    '@babel/preset-env',
    '@babel/core',
    '@babel/polyfill',
    '@babel/register',
    'gulp-babel',
    'gulp-cache',
    'gulp-eslint'
  );
};
