'use strict';

const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.configureDefaultStructure();
  project.configureDist(ProjectItem.directory('dist'));
  project.configureDefaultSetup();
};
