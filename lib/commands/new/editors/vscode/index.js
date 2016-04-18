"use strict";
const ProjectItem = require('../../project-item').ProjectItem;

module.exports = function(project) {
  if (project.model.transpiler === 'typescript') {
    project.addToContent(
      ProjectItem.resource('tsconfig.json', require.resolve('./content/tsconfig.json'))
    );
  } else {
    project.addToContent(
      ProjectItem.resource('jsconfig.json', require.resolve('./content/jsconfig.json'))
    );
  }
}
