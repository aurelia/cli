"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToContent(
    ProjectItem.resource('tslint.json', 'content/tslint.json'),
    ProjectItem.resource('tsconfig.json', 'content/tsconfig.json')
  ).addToTasks(
    ProjectItem.resource('build-javascript.ts', 'tasks/build-typescript.ts')
  ).addToDevDependencies(
    "gulp-tsb",
    "gulp-tslint",
    "tslint",
    "typescript",
    "typescript-register"
  );
};
