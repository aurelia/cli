'use strict';

const ProjectItem = require('../../../../project-item').ProjectItem;
const path = require('path');

module.exports = function(project, options) {
  let model = project.model;

  let configurePlatform = require(`./platforms/${model.platform.id}`);
  configurePlatform(project, options);

  let configureTranspiler = require(`./transpilers/${model.transpiler.id}`);
  configureTranspiler(project, options);

  let configureMarkupProcessor = require(`./markup-processors/${model.markupProcessor.id}`);
  configureMarkupProcessor(project, options);

  let configureCSSProcessor = require(`./css-processors/${model.cssProcessor.id}`);
  configureCSSProcessor(project, options);

  let configureUnitTestRunner = require(`./unit-test-runners/${model.unitTestRunner.id}`);
  configureUnitTestRunner(project, options);

  let configureEditor = require(`./editors/${model.editor.id}`);
  configureEditor(project, options);

  model.build = {
    targets: [
      model.platform
    ],
    options: {
      minify: 'stage & prod',
      sourcemaps: 'dev & stage'
    },
    bundles: [
      {
        name: 'app-bundle.js',
        source: [
          '[**/*.js]',
          '**/*.{css,html}'
        ]
      },
      {
        name: 'vendor-bundle.js',
        prepend: [
          'node_modules/bluebird/js/browser/bluebird.core.js',
          'node_modules/aurelia-cli/lib/resources/scripts/configure-bluebird.js'
        ],
        dependencies: [
          'aurelia-binding',
          'aurelia-bootstrapper',
          'aurelia-dependency-injection',
          'aurelia-event-aggregator',
          'aurelia-framework',
          'aurelia-history',
          'aurelia-history-browser',
          'aurelia-loader',
          'aurelia-loader-default',
          'aurelia-logging',
          'aurelia-logging-console',
          'aurelia-metadata',
          'aurelia-pal',
          'aurelia-pal-browser',
          'aurelia-path',
          'aurelia-polyfills',
          'aurelia-route-recognizer',
          'aurelia-router',
          'aurelia-task-queue',
          'aurelia-templating',
          'aurelia-templating-binding',
          {
            'name': 'aurelia-templating-resources',
            'path': '../node_modules/aurelia-templating-resources/dist/amd',
            'main': 'aurelia-templating-resources'
          },
          {
            'name': 'aurelia-templating-router',
            'path': '../node_modules/aurelia-templating-router/dist/amd',
            'main': 'aurelia-templating-router'
          },
          {
            'name': 'aurelia-testing',
            'path': '../node_modules/aurelia-testing/dist/amd',
            'main': 'aurelia-testing',
            'env': 'dev'
          }
        ]
      }
    ]
  };

  let appRoot = project.projectOutput.calculateRelativePath(project.root);
  let srcRoot = project.src.calculateRelativePath(project.root);

  model.platform.index = path.posix.join(appRoot, 'index.html');
  model.platform.baseDir = '.';
  model.transpiler.source = path.posix.join(srcRoot, '**/*' + model.transpiler.fileExtension);
  model.markupProcessor.source = path.posix.join(srcRoot, '**/*' + model.markupProcessor.fileExtension);
  model.cssProcessor.source = path.posix.join(srcRoot, '**/*' + model.cssProcessor.fileExtension);

  if (model.platform.id === 'aspnetcore') {
    model.platform.baseUrl = project.dist.calculateRelativePath(project.projectOutput);
    model.platform.baseDir = './wwwroot';
  }

  if (project.unitTests.parent) {
    model.unitTestRunner.source = path.posix.join(
      project.unitTests.calculateRelativePath(project.root),
      '**/*' + model.transpiler.fileExtension
    );
  }

  project.addToSource(
    ProjectItem.resource('main.ext', 'src/main-cli.ext', model.transpiler)
  ).addToTasks(
    ProjectItem.resource('build.ext', 'tasks/build.ext', model.transpiler),
    ProjectItem.resource('build.json', 'tasks/build.json'),
    ProjectItem.resource('copy-files.ext', 'tasks/copy-files.ext', model.transpiler),
    ProjectItem.resource('run.ext', 'tasks/run.ext', model.transpiler),
    ProjectItem.resource('run.json', 'tasks/run.json'),
    ProjectItem.resource('watch.ext', 'tasks/watch.ext', model.transpiler)
  ).addToDevDependencies(
      'browser-sync',
      'connect-history-api-fallback',
      'debounce',
      'gulp-changed-in-place',
      'gulp-plumber',
      'gulp-rename',
      'gulp-sourcemaps',
      'gulp-notify',
      'gulp-watch'
  );

  let configureLoader = require(`./loaders/${model.loader.id}`);
  configureLoader(project, options);
};
