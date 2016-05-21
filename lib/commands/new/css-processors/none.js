"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToContent(
    ProjectItem.directory('styles')
  ).addToTasks(
    ProjectItem.resource('build-styles.js', 'tasks/build-styles.js')
  );
};
