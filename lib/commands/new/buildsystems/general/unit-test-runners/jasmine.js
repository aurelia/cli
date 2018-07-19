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
        ProjectItem.resource('app.spec.ext', 'test/unit/app.spec.ext', project.model.transpiler)
      )
    )
  );

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
