"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToContent(
    ProjectItem.directory('styles')
  ).addToTasks(
    ProjectItem.resource('build-styles.ext', 'tasks/build-styles.ext', project.model.transpiler)
  );
};
