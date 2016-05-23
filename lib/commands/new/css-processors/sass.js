"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('build-styles-sass.ext', 'tasks/build-styles.js', project.model.transpiler)
  ).addToDevDependencies(
    'gulp-sass'
  );
};
