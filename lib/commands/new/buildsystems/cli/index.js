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

  let configureJsonProcessor = require(`./json-processors/${model.jsonProcessor.id}`);
  configureJsonProcessor(project, options);

  let unitTestRunners = project.model.unitTestRunners;
  if (unitTestRunners) {
    for (let i = 0; i < unitTestRunners.length; i++) {
      let configureUnitTestRunner = require(`./unit-test-runners/${unitTestRunners[i].id}`);
      configureUnitTestRunner(project);
    }
  }

  if (model.integrationTestRunner) {
    let configureIntegrationTestRunner = require(`./integration-test-runner/${model.integrationTestRunner.id}`);
    configureIntegrationTestRunner(project);
  }

  let configureEditor = require(`./editors/${model.editor.id}`);
  configureEditor(project, options);

  model.build = {
    targets: [
      model.platform
    ],
    options: {
      minify: 'stage & prod',
      sourcemaps: 'dev & stage',
      rev: false,
      cache: 'dev & stage'
    },
    bundles: [
      {
        name: 'app-bundle.js',
        source: [
          '**/*.{js,json,css,html}'
        ]
      },
      {
        name: 'vendor-bundle.js',
        prepend: [
          'node_modules/bluebird/js/browser/bluebird.core.js',
          {
            'path': 'node_modules/aurelia-cli/lib/resources/scripts/configure-bluebird-no-long-stacktraces.js',
            'env': 'stage & prod'
          },
          {
            'path': 'node_modules/aurelia-cli/lib/resources/scripts/configure-bluebird.js',
            'env': 'dev'
          },
          'node_modules/@babel/polyfill/browser.js'
        ],
        dependencies: [
          // only needs packages not explicitly depend
          'aurelia-bootstrapper',
          'aurelia-loader-default',
          'aurelia-pal-browser',

          // aurelia-testing is always loaded dynamically
          {
            'name': 'aurelia-testing',
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
  model.jsonProcessor.source = path.posix.join(srcRoot, '**/*' + model.jsonProcessor.fileExtension);

  if (model.platform.id === 'aspnetcore') {
    model.platform.baseUrl = project.dist.calculateRelativePath(project.projectOutput);
    model.platform.baseDir = './wwwroot';
  }

  if (project.unitTests.parent) {
    for (let testRunner of model.unitTestRunners) {
      testRunner.source = path.posix.join(
        project.unitTests.calculateRelativePath(project.root),
        '**/*' + model.transpiler.fileExtension
      );
    }
  }

  for (let featureName in model.features) {
    project.addFeature(featureName, project, model, options);
  }

  project.addToSource(
    ProjectItem.resource('main.ext', 'src/main-cli.template.ext', model.transpiler)
    .asTemplate(model)
  ).addToTasks(
    ProjectItem.resource('build.ext', 'tasks/build.ext', model.transpiler),
    ProjectItem.resource('build.json', 'tasks/build.json'),
    ProjectItem.resource('clear-cache.ext', 'tasks/clear-cache.ext', model.transpiler),
    ProjectItem.resource('clear-cache.json', 'tasks/clear-cache.json'),
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
