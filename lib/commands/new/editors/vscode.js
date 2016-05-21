"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  if (project.model.transpiler === 'typescript') {
    project.addToContent(
      ProjectItem.resource('tsconfig.json', 'content/tsconfig.json')
    );
  } else {
    project.addToContent(
      ProjectItem.resource('jsconfig.json', 'content/jsconfig.json')
    );
  }
}
