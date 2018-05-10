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
        ProjectItem.resource('setup.ext', 'test/setup.js', project.model.transpiler),
        ProjectItem.resource('app.spec.ext', 'test/unit/app.spec.template.ext', project.model.transpiler)
        .asTemplate(project.model)
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

  if (project.model.features.navigation === 'navigation') {
    project.addToContent(
      project.tests.add(
        project.unitTests.add(
          ProjectItem.resource('child-router.spec.ext', 'test/unit/child-router.spec.ext', project.model.transpiler)
          .asTemplate(project.model),
          ProjectItem.resource('users.spec.ext', 'test/unit/users.spec.ext', project.model.transpiler)
          .asTemplate(project.model)
        )
      )
    );
  }
  if (project.model.transpiler.id === 'babel') {
    project.addToDevDependencies('karma-babel-preprocessor');
  } else {
    project.addToDevDependencies('karma-typescript-preprocessor');

    project.addToDevDependencies('@types/jasmine');
  }
};
