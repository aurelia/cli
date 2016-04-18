"use strict";
const Project = require('../../project').Project;
const ProjectItem = require('../../project-item').ProjectItem;

module.exports = function(project) {
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
      ProjectItem.jsonObject('aurelia.json', project.model),
      ProjectItem.directory('modules').add(
        ProjectItem.resource('config.js', require.resolve('../shared/config.js')),
        ProjectItem.resource('loader.js', require.resolve('../shared/require.js')),
        ProjectItem.resource('text.js', require.resolve('../shared/text.js'))
      )
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
    'aurelia-cli',
    'browser-sync'
  ).addToTasks(
    ProjectItem.resource('serve.js', require.resolve('./tasks/serve.js')),
    ProjectItem.resource('run.js', require.resolve('./tasks/run.js'))
  );

  return project;
};
