'use strict';

module.exports = function(project) {
  project.configureVisualStudioStructure(project.model.loader.id);
  project.configureDefaultSetup();
};
