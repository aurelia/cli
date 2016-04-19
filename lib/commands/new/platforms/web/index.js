"use strict";
const ItemTemplate = require('../../item-template').ItemTemplate;

module.exports = function(project) {
  project.content = project.root;
  project.addToContent(
    project.src.add(
      project.resources
    ),
    project.scripts.add(
      ItemTemplate.resource('config.js', require.resolve('../shared/config.js')),
      ItemTemplate.resource('loader.js', require.resolve('../shared/require.js')),
      ItemTemplate.resource('text.js', require.resolve('../shared/text.js'))
    ),
    project.tests.add(
      project.unitTests,
      project.e2eTests
    ),
    ItemTemplate.jsonObject('package.json', project.package),
    ItemTemplate.directory('aurelia_project').add(
      project.tasks,
      ItemTemplate.jsonObject('aurelia.json', project.model)
    ),
    ItemTemplate.resource('.editorconfig', require.resolve('../shared/.editorconfig')),
    ItemTemplate.resource('.gitignore', require.resolve('../shared/.gitignore')),
    ItemTemplate.resource('favicon.ico', require.resolve('../shared/favicon.ico')),
    ItemTemplate.resource('index.html', require.resolve('../shared/index.html'))
  ).addToClientDependencies(
    'aurelia-bootstrapper',
    'aurelia-fetch-client',
    'aurelia-animator-css'
  ).addToDevDependencies(
    'aurelia-cli',
    'browser-sync'
  ).addToTasks(
    ItemTemplate.resource('serve.js', require.resolve('./tasks/serve.js')),
    ItemTemplate.resource('run.js', require.resolve('./tasks/run.js'))
  );
};
