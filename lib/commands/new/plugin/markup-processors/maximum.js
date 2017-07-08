'use strict';
const ProjectItem = require('../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('process-markup.ext', 'tasks/plugin/process-markup-minify-max.ext', project.model.transpiler)
  ).addToDevDependencies(
    'gulp-htmlmin',
    'html-minifier'
  );

  if (project.model.transpiler.id === 'typescript') {
    project.addToDevDependencies(
      '@types/gulp-htmlmin',
      '@types/html-minifier'
    );
  }
};
