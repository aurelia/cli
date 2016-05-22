"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('build-styles-none.js', 'tasks/build-styles.ext', project.model.transpiler)
  );
};
