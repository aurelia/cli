"use strict";
const ProjectItem = require('../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToContent(
    ProjectItem.directory('styles')
  ).addToTasks(
    ProjectItem.resource('build-styles.js', require.resolve('./tasks/build-styles.js'))
  ).addToDevDependencies(
    'browser-sync'
  )
};
