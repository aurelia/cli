"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('process-markup-minify-max.ext', 'tasks/process-markup.ext', project.model.transpiler)
  ).addToDevDependencies(
    'gulp-htmlmin',
    'html-minifier'
  );
};
