'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToContent(
    ProjectItem.resource('.eslintrc.json', 'content/eslintrc.json'),
    ProjectItem.resource('.babelrc.js', 'content/babelrc.js')
  ).addToDevDependencies(
    'babel-eslint',
    'eslint',
    'babel-loader',
    '@babel/core',
    '@babel/plugin-proposal-decorators',
    '@babel/plugin-proposal-class-properties',
    '@babel/preset-env',
    '@babel/core',
    '@babel/polyfill',
    '@babel/register',
    'babel-plugin-istanbul'
  );
};
