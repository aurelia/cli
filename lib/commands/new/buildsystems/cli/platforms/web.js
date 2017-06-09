'use strict';

const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function (project, options, target) {
  if (target === undefined) {
    project.configureDefaultStructure();
    project.configureDist(ProjectItem.directory('scripts'));
  }
  else {
    project.configureDefaultSetup();
    project.configureBuild(target)
  }
};
