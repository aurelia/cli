'use strict';
const ProjectItem = require('../../project-item').ProjectItem;

module.exports = function (project, model, options) {
  project.addFeature('jquery', project, model, options);

  const baseDir = (model.bundler.id !== 'webpack' ? model.platform.baseDir : 'dist');
  project.addToDependencies(
    'bootstrap@^3.3.6'
  );
  if (model.bundler.id !== 'webpack') {
    project.addToCopyFiles(
      {
        'node_modules/bootstrap/dist/fonts/*': baseDir + '/bootstrap/fonts'
      }
    ).addToAureliaDependencies(
      {
        'name': 'bootstrap',
        'path': '../node_modules/bootstrap',
        'main': 'dist/js/bootstrap.min',
        'deps': [
          'jquery'
        ]
      }
    );
  }
};
