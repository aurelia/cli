"use strict";
const ProjectItem = require('../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToSource(
    ProjectItem.resource('main.js', require.resolve('./src/main.js')),
    ProjectItem.resource('app.js', require.resolve('./src/app.js')),
    ProjectItem.resource('app.html', require.resolve('./src/app.html'))
  ).addToUnitTests(
    ProjectItem.resource('setup.js', require.resolve('./test/setup.js'))
  ).addToContent(
    ProjectItem.resource('.eslintrc', require.resolve('./content/.eslintrc')),
    ProjectItem.resource('.babelrc', require.resolve('./content/.babelrc'))
  ).addToTasks(
    ProjectItem.resource('clean.js', require.resolve('./tasks/clean.js')),
    ProjectItem.resource('build-javascript.js', require.resolve('./tasks/build-javascript.js')),
    ProjectItem.resource('build-html.js', require.resolve('./tasks/build-html.js')),
    ProjectItem.resource('build.js', require.resolve('./tasks/build.js'))
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
    'del',
    'gulpjs/gulp#4.0',
    'gulp-babel',
    'gulp-changed',
    'gulp-plumber',
    'gulp-sourcemaps',
    'gulp-notify'
  );
};
