"use strict";
const ItemTemplate = require('../../item-template').ItemTemplate;

module.exports = function(project) {
  project.addToSource(
    ItemTemplate.resource('main.js', require.resolve('./src/main.js')),
    ItemTemplate.resource('app.js', require.resolve('./src/app.js')),
    ItemTemplate.resource('app.html', require.resolve('./src/app.html'))
  ).addToResources(
    ItemTemplate.resource('index.js', require.resolve('./src/resources/index.js'))
  ).addToUnitTests(
    ItemTemplate.resource('setup.js', require.resolve('./test/setup.js'))
  ).addToContent(
    ItemTemplate.resource('.eslintrc', require.resolve('./content/.eslintrc')),
    ItemTemplate.resource('.babelrc', require.resolve('./content/.babelrc'))
  ).addToTasks(
    ItemTemplate.resource('clean.js', require.resolve('./tasks/clean.js')),
    ItemTemplate.resource('clean.json', require.resolve('./tasks/clean.json')),
    ItemTemplate.resource('build-javascript.js', require.resolve('./tasks/build-javascript.js')),
    ItemTemplate.resource('build-html.js', require.resolve('./tasks/build-html.js')),
    ItemTemplate.resource('build.js', require.resolve('./tasks/build.js')),
    ItemTemplate.resource('build.json', require.resolve('./tasks/build.json'))
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
