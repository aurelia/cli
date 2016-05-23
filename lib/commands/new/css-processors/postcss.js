"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('build-styles.ext', 'tasks/build-styles-postcss.js', project.model.transpiler)
  ).addToDevDependencies(
    'gulp-postcss',
    'autoprefixer'
  );
};
