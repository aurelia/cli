"use strict";
const Project = require('../../project').Project;
const ProjectItem = require('../../project-item').ProjectItem;

module.exports = function(choices, rootFolder) {
  let project = new Project(choices, rootFolder);
  project.content = project.root;

  project.addToContent(
    project.src,
    project.tests.add(
      project.unitTests,
      project.e2eTests
    ),
    ProjectItem.jsonObject('package.json', project.package),
    ProjectItem.directory('aurelia_project').add(
      project.tasks,
      ProjectItem.jsonObject('config.json', project.model)
    ),
    ProjectItem.directory('client_modules').add(
      ProjectItem.resource('require.js', require.resolve('../shared/require.js'))
    ),
    ProjectItem.resource('.editorconfig', require.resolve('../shared/.editorconfig')),
    ProjectItem.resource('.gitignore', require.resolve('../shared/.gitignore')),
    ProjectItem.resource('favicon.ico', require.resolve('../shared/favicon.ico')),
    ProjectItem.resource('index.html', require.resolve('../shared/index.html'))
  ).addToClientDependencies(
    'aurelia-bootstrapper',
    'aurelia-fetch-client',
    'aurelia-animator-css'
  ).addToDevDependencies(
    'aurelia-cli'
  );

  return project;
};
