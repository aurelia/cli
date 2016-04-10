"use strict";
const Project = require('../project').Project;
const ProjectItem = require('../project-item').ProjectItem;

module.exports = function(choices, rootFolder) {
  let project = new Project(choices, rootFolder);
  project.content = project.root;

  project.addToContent(
    project.src,
    ProjectItem.jsonObject('package.json', project.package),
    project.tests
  );

  project.addToTests(
    project.unitTests,
    project.e2eTests
  );

  project.addClientDependency('aurelia-bootstrapper');
  project.addClientDependency('aurelia-fetch-client');
  project.addClientDependency('aurelia-animator-css');

  return project;
};
