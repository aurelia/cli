'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  const cypressResourceFolder = 'test/cypress';
  const isUsingTypescript = project.model.transpiler.id === 'typescript';

  if (isUsingTypescript) {
    project.addToDevDependencies(
      '@cypress/webpack-preprocessor'
    );
  }

  const testDirResources = [
    ProjectItem.directory('fixtures').add(
      ProjectItem.resource('example.json', `${cypressResourceFolder}/fixtures/example.json`)
    ),
    ProjectItem.directory('integration').add(
      ProjectItem.resource('app.e2e.ext', `${cypressResourceFolder}/integration/app.e2e.ext`, project.model.transpiler)
    ),
    ProjectItem.directory('plugins').add(
      ProjectItem.resource('index.js', `${cypressResourceFolder}/plugins/index.ext`, project.model.transpiler)
    ),
    ProjectItem.directory('screenshots'),
    ProjectItem.directory('support').add(
      ProjectItem.resource('index.js', `${cypressResourceFolder}/support/index.js`),
      ProjectItem.resource('commands.ext', `${cypressResourceFolder}/support/commands.ext`, project.model.transpiler)
    ),
    ProjectItem.directory('videos')
  ];

  if (isUsingTypescript) {
    testDirResources.push(ProjectItem.resource('tsconfig.json', `${cypressResourceFolder}/tsconfig.json`));
  }

  project.addToTasks(
    ProjectItem.resource('cypress.ext', 'tasks/cypress.ext', project.model.transpiler),
    ProjectItem.resource('cypress.json', 'tasks/cypress.json')
  ).addToDevDependencies(
    'cypress'
  ).addToContent(
    ProjectItem.resource('cypress.json', 'content/cypress.json'),
    project.tests.add(
      project.e2eTests.add(...testDirResources)
    )
  );
};
