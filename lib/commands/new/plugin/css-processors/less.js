'use strict';
const ProjectItem = require('../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('process-css.ext', 'tasks/plugin/process-less.ext', project.model.transpiler)
  ).addToDevDependencies(
    'gulp-less',
    'less-loader'
  );

  if (project.model.transpiler.id === 'typescript') {
    project.addToDevDependencies(
      '@types/gulp-less'
    );
  }
};
