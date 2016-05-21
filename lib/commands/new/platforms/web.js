"use strict";
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.content = project.root;

  project.addToContent(
    project.projectFolder,
    project.src,
    project.dist,
    project.scripts.add(
      ProjectItem.resource('config.js', 'scripts/config.js'),
      ProjectItem.resource('loader.js', 'scripts/require.js'),
      ProjectItem.resource('text.js', 'scripts/text.js')
    ),
    project.tests,
    ProjectItem.jsonObject('package.json', project.package),
    ProjectItem.resource('.editorconfig', 'content/editorconfig'),
    ProjectItem.resource('.gitignore', 'content/gitignore'),
    ProjectItem.resource('favicon.ico', 'img/favicon.ico'),
    ProjectItem.resource('index.html', 'content/index.html')
  ).addToClientDependencies(
    'aurelia-bootstrapper',
    'aurelia-fetch-client',
    'aurelia-animator-css'
  ).addToDevDependencies(
    'aurelia-cli',
    'browser-sync'
  ).addToTasks(
    ProjectItem.resource('serve.ext', 'tasks/serve.ext', project.model.transpiler),
    ProjectItem.resource('serve.json', 'tasks/serve.json'),
    ProjectItem.resource('run.ext', 'tasks/run.ext', project.model.transpiler),
    ProjectItem.resource('run.json', 'tasks/run.json')
  );
};
