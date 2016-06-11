"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;
const typings = require('../../../resources/content/typings.json');

module.exports = function(project) {
  typings.name = project.package.name;

  project.model.paths.dtsSource = [
    './typings/**/*.d.ts',
    './custom_typings/**/*.d.ts'
  ];

  project.addToContent(
    ProjectItem.resource('tslint.json', 'content/tslint.json'),
    ProjectItem.resource('tsconfig.json', 'content/tsconfig.json'),
    ProjectItem.jsonObject('typings.json', typings)
  ).addToTasks(
    ProjectItem.resource('build-javascript.ts', 'tasks/build-javascript.ts')
  ).addToDevDependencies(
    "gulp-tsb", //switch to gulp-typescript for sourcemaps
    "gulp-tslint",
    "tslint",
    "typescript",
    "typings"
  ).addPostInstallProcess({
    description: 'Installing Typings',
    command: 'node',
    args: ['node_modules/typings/dist/bin.js', 'install']
  });
};
