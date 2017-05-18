'use strict';
const ProjectItem = require('../../../project-item').ProjectItem;

module.exports = function(project) {
  project.loader = project.model.loader.id;
  delete project.model.loader; // remove loader from model as it is actually a property of model.build

  project.loaderTextPlugin = 'text';
  project.loaderScript = 'node_modules/requirejs/require.js';
  project.addToContent(
    ProjectItem.resource('index.html', 'content/require.index.html')
  ).addToClientDependencies(
    'requirejs',
    'text'
  );
};
