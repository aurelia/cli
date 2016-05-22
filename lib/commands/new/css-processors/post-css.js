"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('build-styles-post-css.js', 'tasks/build-styles.ext', project.model.transpiler)
  ).addToDevDependencies(
    'gulp-postcss',
    'autoprefixer'
  );
};
