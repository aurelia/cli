'use strict';

const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.configureDefaultStructure();
  project.configurePort(9000);
  project.configureDist(ProjectItem.directory('scripts'));
  project.configureDefaultSetup();
};
