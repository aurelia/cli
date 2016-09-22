"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;
const typings = require('../../../resources/content/typings.json');

module.exports = function(project) {
  typings.name = project.package.name;

  project.model.transpiler.dtsSource = [
    './typings/**/*.d.ts',
    './custom_typings/**/*.d.ts'
  ];

  project.addToContent(
    ProjectItem.resource('tslint.json', 'content/tslint.json'),
    ProjectItem.resource('tsconfig.json', 'content/tsconfig.json'),
    ProjectItem.jsonObject('typings.json', typings),
    ProjectItem.directory('custom_typings').add(
      ProjectItem.resource('aurelia-protractor.d.ts', 'content/aurelia-protractor.d.ts')
    )
  ).addToTasks(
    ProjectItem.resource('transpile.ts', 'tasks/transpile.ts')
  ).addToDevDependencies(
    'event-stream',
    'gulp-typescript',
    'gulp-tslint',
    'tslint',
    'typescript',
    'typings'
  ).addPostInstallProcess({
    description: 'Installing Typings',
    command: 'node',
    args: ['node_modules/typings/dist/bin.js', 'install']
  });
};
