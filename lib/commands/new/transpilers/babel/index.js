"use strict";
const ProjectItem = require('../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToSource(
    ProjectItem.resource('main.js', require.resolve('./src/main.js')),
    ProjectItem.resource('app.js', require.resolve('./src/app.js')),
    ProjectItem.resource('app.html', require.resolve('./src/app.html'))
  ).addToResources(
    ProjectItem.resource('index.js', require.resolve('./src/resources/index.js'))
  ).addToUnitTests(
    ProjectItem.resource('setup.js', require.resolve('./test/setup.js'))
  ).addToContent(
    ProjectItem.resource('.eslintrc', require.resolve('./content/.eslintrc')),
    ProjectItem.resource('.babelrc', require.resolve('./content/.babelrc'))
  ).addToTasks(
    ProjectItem.resource('clean.js', require.resolve('./tasks/clean.js')),
    ProjectItem.resource('clean.json', require.resolve('./tasks/clean.json')),
    ProjectItem.resource('build-javascript.js', require.resolve('./tasks/build-javascript.js')),
    ProjectItem.resource('build-html.js', require.resolve('./tasks/build-html.js')),
    ProjectItem.resource('build.js', require.resolve('./tasks/build.js')),
    ProjectItem.resource('build.json', require.resolve('./tasks/build.json'))
  ).addToGenerators(
    ProjectItem.resource('attribute.js', require.resolve('./generators/attribute.js')),
    ProjectItem.resource('attribute.json', require.resolve('./generators/attribute.json')),
    ProjectItem.resource('element.js', require.resolve('./generators/element.js')),
    ProjectItem.resource('element.json', require.resolve('./generators/element.json')),
    ProjectItem.resource('value-converter.js', require.resolve('./generators/value-converter.js')),
    ProjectItem.resource('value-converter.json', require.resolve('./generators/value-converter.json')),
    ProjectItem.resource('binding-behavior.js', require.resolve('./generators/binding-behavior.js')),
    ProjectItem.resource('binding-behavior.json', require.resolve('./generators/binding-behavior.json')),
    ProjectItem.resource('task.js', require.resolve('./generators/task.js')),
    ProjectItem.resource('task.json', require.resolve('./generators/task.json')),
    ProjectItem.resource('generator.js', require.resolve('./generators/generator.js')),
    ProjectItem.resource('generator.json', require.resolve('./generators/generator.json'))
  ).addToEnvironments(
      ProjectItem.resource('dev.js', require.resolve('./environments/dev.js')),
      ProjectItem.resource('stage.js', require.resolve('./environments/stage.js')),
      ProjectItem.resource('prod.js', require.resolve('./environments/prod.js'))
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
    'gulp-rename',
    'gulp-sourcemaps',
    'gulp-notify'
  );
};
