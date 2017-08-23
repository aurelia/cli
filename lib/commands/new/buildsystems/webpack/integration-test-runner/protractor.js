'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  let transpilerId = project.model.transpiler.id;
  let testContentRoot = `test/webpack/${transpilerId}`;

  if (project.model.transpiler.id === 'babel') {
    project.addToDevDependencies(
      'ts-node'
    );
  }

  project.addToDevDependencies(
    'aurelia-protractor-plugin',
    'protractor',
    'wait-on'
  ).addToContent(
    project.tests.add(
      project.e2eTests.add(
        ProjectItem.resource('demo.e2e.ext', `${testContentRoot}/e2e/demo.e2e.ext`, project.model.transpiler),
        ProjectItem.resource('skeleton.po.ext', `${testContentRoot}/e2e/skeleton.po.ext`, project.model.transpiler),
        ProjectItem.resource('welcome.po.ext', `${testContentRoot}/e2e/welcome.po.ext`, project.model.transpiler)
      ),
      ProjectItem.resource('protractor.conf.js', `${testContentRoot}/protractor.conf.js`)
    )
  );

  // prevent duplicate typescript definitions
  if (!project.model.unitTestRunner.find(x => x.id === 'jest')) {
    project.addToDevDependencies('@types/jasmine');
  }
};
