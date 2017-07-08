'use strict';
const ProjectItem = require('../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('process-css.ext', 'tasks/plugin/process-stylus.ext', project.model.transpiler)
  ).addToDevDependencies(
    'gulp-stylus',
    'stylus-loader'
  );
};
