'use strict';
const ProjectItem = require('../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('process-css.ext', 'tasks/plugin/process-sass.ext', project.model.transpiler)
  ).addToDevDependencies(
    'gulp-sass',
    'sass-loader'
  );

  if (project.model.transpiler.id === 'typescript') {
    project.addToDevDependencies(
      '@types/gulp-sass'
    );
  }
};
