'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.model.transpiler.dtsSource = [
    './types/**/*.d.ts'
  ];

  project.addToContent(
    ProjectItem.resource('tslint.json', 'content/tslint.json'),
    ProjectItem.resource('tsconfig.json', 'content/tsconfig.template.json')
      .asTemplate(project.model),
    ProjectItem.directory('types')
  ).addToTasks(
    ProjectItem.resource('transpile.ts', 'tasks/transpile.ts'),
    ProjectItem.resource('lint.ts', 'tasks/lint.ts')
  ).addToDevDependencies(
    'gulp-typescript',
    'gulp-tslint',
    'merge2',
    'tslint',
    'typescript',
    '@types/node'
  );
};
