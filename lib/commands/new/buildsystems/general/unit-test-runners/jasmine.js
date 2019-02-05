'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.model.testFramework = {
    'id': 'jasmine',
    'displayName': 'Jasmine'
  };

  project.addToContent(
    project.tests.add(
      project.unitTests.add(
        ProjectItem.resource('app.spec.ext', 'test/unit/app.spec.template.ext', project.model.transpiler)
          .asTemplate(project.model)
      )
    )
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
    project.addToContent(
      project.tests.add(
        project.unitTests.add(
          ProjectItem.resource('.eslintrc', 'test/unit/.eslintrc')
        )
      )
    );
  }
};
