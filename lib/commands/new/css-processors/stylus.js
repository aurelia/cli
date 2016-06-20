"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('process-css.ext', 'tasks/process-stylus.ext', project.model.transpiler)
  ).addToDevDependencies(
    'gulp-stylus'
  );
};
