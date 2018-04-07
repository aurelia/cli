'use strict';

const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.configureDefaultStructure();
  project.configurePort(8080);
  project.configureDist(ProjectItem.directory('dist'));
  project.configureDefaultSetup();
};
