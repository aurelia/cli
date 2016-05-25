"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('build-markup.ext', 'tasks/build-markup.ext', project.model.transpiler)
  );
};
