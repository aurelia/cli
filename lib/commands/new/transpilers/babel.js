"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToSource(
    ProjectItem.resource('main.js', 'src/main.js'),
    ProjectItem.resource('app.js', 'src/app.js'),
    ProjectItem.resource('app.html', 'src/app.html')
  ).addToResources(
    ProjectItem.resource('index.js', 'src/resources/index.js')
  ).addToUnitTests(
    ProjectItem.resource('setup.js', 'test/setup.js')
  ).addToContent(
    ProjectItem.resource('.eslintrc', 'content/eslintrc'),
    ProjectItem.resource('.babelrc', 'content/babelrc')
  ).addToTasks(
    ProjectItem.resource('clean.js', 'tasks/clean.js'),
    ProjectItem.resource('clean.json', 'tasks/clean.json'),
    ProjectItem.resource('build-javascript.js', 'tasks/build-javascript.js'),
    ProjectItem.resource('build-html.js', 'tasks/build-html.js'),
    ProjectItem.resource('build.js', 'tasks/build.js'),
    ProjectItem.resource('build.json', 'tasks/build.json')
  ).addToGenerators(
    ProjectItem.resource('attribute.js', 'generators/attribute.js'),
    ProjectItem.resource('attribute.json', 'generators/attribute.json'),
    ProjectItem.resource('element.js', 'generators/element.js'),
    ProjectItem.resource('element.json', 'generators/element.json'),
    ProjectItem.resource('value-converter.js', 'generators/value-converter.js'),
    ProjectItem.resource('value-converter.json', 'generators/value-converter.json'),
    ProjectItem.resource('binding-behavior.js', 'generators/binding-behavior.js'),
    ProjectItem.resource('binding-behavior.json', 'generators/binding-behavior.json'),
    ProjectItem.resource('task.js', 'generators/task.js'),
    ProjectItem.resource('task.json', 'generators/task.json'),
    ProjectItem.resource('generator.js', 'generators/generator.js'),
    ProjectItem.resource('generator.json', 'generators/generator.json')
  ).addToEnvironments(
      ProjectItem.resource('dev.js', 'environments/dev.js'),
      ProjectItem.resource('stage.js', 'environments/stage.js'),
      ProjectItem.resource('prod.js', 'environments/prod.js')
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
