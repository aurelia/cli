"use strict";
const Project = require('../project').Project;
const ProjectItem = require('../project-item').ProjectItem;

module.exports = function(choices, rootFolder) {
  let project = new Project(choices, rootFolder);

  project.withChild(project.src);
  project.content = project.root;
  project.content
    .withChild(ProjectItem.jsonObject('package.json', project.package))
    .withChild(project.test);

  return project;
};
