'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  let configPath;

  if (project.model.transpiler.id === 'typescript') {
    project.addToDevDependencies(
      'ts-node'
    );

    // prevent duplicate typescript definitions
    if (!project.model.unitTestRunners.find(x => x.id === 'jest')) {
      project.addToDevDependencies('@types/jasmine');
    }

    configPath = 'test/protractor.typescript.conf.js';
  } else if (project.model.transpiler.id === 'babel') {
    configPath = 'test/protractor.babel.conf.js';
  }

  project.addToTasks(
    ProjectItem.resource('protractor.ext', 'tasks/protractor.ext', project.model.transpiler),
    ProjectItem.resource('protractor.json', 'tasks/protractor.json')
  ).addToDevDependencies(
    'aurelia-protractor-plugin',
    'protractor',
    'gulp-protractor',
    'wait-on'
  ).addToContent(
    project.tests.add(
      project.e2eTests.add(
        ProjectItem.resource('demo.e2e.ext', 'test/e2e/demo.e2e.ext', project.model.transpiler),
        ProjectItem.resource('skeleton.po.ext', 'test/e2e/skeleton.po.ext', project.model.transpiler),
        ProjectItem.resource('welcome.po.ext', 'test/e2e/welcome.po.ext', project.model.transpiler)
      ),
      ProjectItem.resource('protractor.conf.js', configPath)
    )
  );
};
