'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  let configureJasmine = require('../../general/unit-test-runners/jasmine');
  configureJasmine(project);

  let transpilerId = project.model.transpiler.id;
  let testContentRoot = `test/webpack/${transpilerId}`;

  project.addToTasks(
    ProjectItem.resource('karma.ext', 'tasks/karma.ext', project.model.transpiler),
    ProjectItem.resource('karma.json', 'tasks/karma.json')
  ).addToContent(
    project.tests.add(
      ProjectItem.resource('karma.conf.js', `${testContentRoot}/karma.conf.js`),
      ProjectItem.resource('karma-bundle.js', `${testContentRoot}/karma-bundle.js`)
    )
  ).addToDevDependencies(
    'jasmine-core',
    'karma',
    'karma-chrome-launcher',
    'karma-coverage',
    'karma-jasmine',
    'karma-mocha-reporter',
    'karma-webpack',
    'karma-coverage-istanbul-reporter',
    'jest-jasmine2',
    'jest-matchers'
  ).addNPMScript('test', 'npx au karma');

  if (project.model.transpiler.id === 'babel') {
    project.addToDevDependencies('karma-babel-preprocessor');
  } else {
    project.addToDevDependencies('karma-typescript-preprocessor');

    project.addToDevDependencies('@types/jasmine');
  }
};
