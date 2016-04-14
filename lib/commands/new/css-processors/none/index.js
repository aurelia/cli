"use strict";
const ProjectItem = require('../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToContent(
    ProjectItem.directory('styles')
  );
};
