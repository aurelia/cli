"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  if (project.model.transpiler.id !== 'typescript') {
    project.addToContent(
      ProjectItem.resource('jsconfig.json', 'content/jsconfig.json')
    );
  }
};
