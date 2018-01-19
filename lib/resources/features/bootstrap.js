'use strict';
const ProjectItem = require('../../project-item').ProjectItem;

module.exports = function (project, model, options) {
  project.addFeature('jquery', project, model, options);

  project.addToDependencies(
    'bootstrap@^3.3.6'
  );
  if (model.bundler.id !== 'webpack') {
    project.addToAureliaDependencies(
      {
        'name': 'bootstrap',
        'path': '../node_modules/bootstrap/dist',
        'main': 'js/bootstrap.min',
        'deps': [
          'jquery'
        ],
        'exports': '$',
        'resources': [
          'css/bootstrap.css'
        ]
      }
    );
  }
};
