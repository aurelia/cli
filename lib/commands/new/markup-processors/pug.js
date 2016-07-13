"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('process-markup.ext', 'tasks/process-pug.ext', project.model.transpiler)
  ).addToDevDependencies(
    'gulp-jade'
  );
};
