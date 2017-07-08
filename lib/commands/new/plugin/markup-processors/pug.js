'use strict';
const ProjectItem = require('../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('process-markup.ext', 'tasks/plugin/process-pug.ext', project.model.transpiler)
  ).addToDevDependencies(
    'gulp-jade'
  );

  if (project.model.transpiler.id === 'typescript') {
    project.addToDevDependencies(
      '@types/gulp-jade'
    );
  }
};
