'use strict';
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.model.transpiler.dtsSource = [
    './custom_typings/**/*.d.ts'
  ];

  project.addToContent(
    ProjectItem.resource('tslint.json', 'content/tslint.json'),
    ProjectItem.resource('tsconfig.json', 'content/tsconfig.json'),
    ProjectItem.directory('custom_typings')
  ).addToTasks(
    ProjectItem.resource('transpile.ts', 'tasks/transpile.ts')
    ).addToDevDependencies(
    'event-stream',
    'gulp-typescript',
    'gulp-tslint',
    'tslint',
    'typescript',
    '@types/node'
    );
};
