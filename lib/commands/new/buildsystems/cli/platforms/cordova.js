'use strict';

const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project, options, target) {
  project.configureDefaultStructure();
  project.configureDist(ProjectItem.directory('scripts'));
  project.configureDefaultSetup();
  project.configureBuild(target)
};
