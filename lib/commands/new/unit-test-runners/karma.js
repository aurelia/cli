"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.model.testFramework = {
    "id": "jasmine",
    "displayName": "Jasmine"
  };

  project.addToTasks(
    ProjectItem.resource('test.ext', 'tasks/test.ext', project.model.transpiler),
    ProjectItem.resource('test.json', 'tasks/test.json')
  ).addToContent(
    ProjectItem.resource('karma.conf.js', 'content/karma.conf.ext', project.model.transpiler),
    project.tests.add(
      project.unitTests.add(
        ProjectItem.resource('setup.ext', 'test/setup.js', project.model.transpiler),
        ProjectItem.resource('app.spec.ext', 'test/app.spec.js', project.model.transpiler)
      ),
      ProjectItem.resource('aurelia-karma.js', 'test/aurelia-karma.js')
    )
  ).addToDevDependencies(
    'jasmine-core',
    'karma',
    'karma-chrome-launcher',
    'karma-jasmine'
  );

  if (project.model.transpiler.id === 'babel') {
    project.addToDevDependencies('karma-babel-preprocessor');
  } else {
    project.addToDevDependencies('karma-typescript-preprocessor');
  }
};
