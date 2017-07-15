'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.model.testFramework = {
    'id': 'jasmine',
    'displayName': 'Jasmine'
  };

  let transpilerId = project.model.transpiler.id;
  let testContentRoot = `test/webpack/${transpilerId}`;

  project.addToContent(
    project.tests.add(
      project.unitTests.add(
        ProjectItem.resource('app.spec.ext', `${testContentRoot}/unit/app.spec.ext`, project.model.transpiler)
      )
    )
  );

  if (project.model.transpiler.id === 'babel') {
    project.addToContent(
      project.tests.add(
        project.unitTests.add(
          ProjectItem.resource('.eslintrc', `${testContentRoot}/unit/.eslintrc`)
        )
      )
    );
  }
};
