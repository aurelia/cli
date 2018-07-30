'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.model.transpiler.dtsSource = [
    './custom_typings/**/*.d.ts'
  ];

  project.addToContent(
    ProjectItem.resource('tslint.json', 'content/tslint.json'),
    ProjectItem.resource('tsconfig.json', 'content/tsconfig.template.json')
      .asTemplate(project.model),
    ProjectItem.directory('custom_typings')
  ).addToTasks(
    ProjectItem.resource('transpile.ts', 'tasks/transpile.ts'),
    ProjectItem.resource('lint.ts', 'tasks/lint.ts')
  ).addToDevDependencies(
    'event-stream',
    'gulp-typescript',
    'gulp-tslint',
    'tslint',
    'typescript',
    '@types/node'
  );
};
