'use strict';
const ProjectItem = require('../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('process-css.ext', 'tasks/plugin/process-postcss.ext', project.model.transpiler)
  ).addToDevDependencies(
    'gulp-postcss',
    'autoprefixer',
    'postcss-loader'
  );

  if (project.model.transpiler.id === 'typescript') {
    project.addToDevDependencies(
      '@types/autoprefixer'
    );
  }
};
