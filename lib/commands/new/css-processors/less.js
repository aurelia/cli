"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('build-styles-less.ext', 'tasks/build-styles.js', project.model.transpiler)
  ).addToDevDependencies(
    'gulp-less'
  );
};
