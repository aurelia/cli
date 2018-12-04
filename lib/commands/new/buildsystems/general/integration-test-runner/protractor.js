'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  let configPath;

  if (project.model.transpiler.id === 'typescript') {
    project.addToDevDependencies(
      'ts-node'
    );

    if (project.model.unitTestRunner.id !== 'jest') {
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
        ProjectItem.resource('demo.e2e.ext', 'test/e2e/demo.e2e.template.ext', project.model.transpiler)
          .asTemplate(project.model),
        ProjectItem.resource('skeleton.po.ext', 'test/e2e/skeleton.po.template.ext', project.model.transpiler)
          .asTemplate(project.model),
        ProjectItem.resource('welcome.po.ext', 'test/e2e/welcome.po.template.ext', project.model.transpiler)
          .asTemplate(project.model)
      ),
      ProjectItem.resource('protractor.conf.js', configPath)
    )
  ).addNPMScript('protractor', 'au protractor');
};
