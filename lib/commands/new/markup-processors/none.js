"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('process-markup.ext', 'tasks/process-markup.ext', project.model.transpiler)
  );
};
