'use strict';
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.loader = project.model.loader.id;
  delete project.model.loader; // remove loader from model as it is actually a property of model.build

  project.loaderTextPlugin = {
    'name': 'text',
    'path': '../node_modules/systemjs-plugin-text',
    'main': 'text'
  };
  project.loaderScript = 'node_modules/systemjs/dist/system.js';
  project.addToContent(
    ProjectItem.resource('index.html', 'content/system.index.html')
  ).addToClientDependencies(
    'systemjs',
    'systemjs-plugin-text'
  );
};
