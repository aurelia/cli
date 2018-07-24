'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  require('../../general/unit-test-runners/jasmine')(project);

  project.addToTasks(
    ProjectItem.resource('test.ext', 'tasks/test.ext', project.model.transpiler),
    ProjectItem.resource('test.json', 'tasks/test.json')
  ).addToContent(
    ProjectItem.resource('karma.conf.js', 'content/karma.conf.ext', project.model.transpiler),
    project.tests.add(
      project.unitTests.add(
        ProjectItem.resource('setup.ext', 'test/setup.js', project.model.transpiler)
      ),
      ProjectItem.resource('aurelia-karma.js', `test/${project.model.loader.id}.aurelia-karma.js`)
    )
  ).addToDevDependencies(
    'jasmine-core',
    'karma',
    'karma-chrome-launcher',
    'karma-jasmine',
    'karma-sourcemap-loader'
  );

  if (project.model.transpiler.id === 'babel') {
    project.addToDevDependencies('karma-babel-preprocessor');
  } else {
    project.addToDevDependencies('karma-typescript-preprocessor');

    // prevent duplicate typescript definitions
    if (!project.model.unitTestRunners.find(x => x.id === 'jest')) {
      project.addToDevDependencies('@types/jasmine');
    }
  }
};
