'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToTasks(
    ProjectItem.resource('process-json.ext', 'tasks/process-json.ext', project.model.transpiler)
  );
};
