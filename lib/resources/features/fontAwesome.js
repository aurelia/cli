'use strict';
const ProjectItem = require('../../project-item').ProjectItem;

module.exports = function (project, model, options) {
  const baseDir = (model.bundler.id !== 'webpack' ? model.platform.baseDir : 'dist');

  project.addToDependencies(
    'font-awesome@4.6.3'
  );
  if (model.bundler.id !== 'webpack') {
    project.addToCopyFiles(
      {
        './node_modules/font-awesome/fonts/**/*.*': baseDir + '/fonts'
      }
    ).addToAureliaDependencies(
      {
        'name': 'font-awesome',
        'path': '../node_modules/font-awesome/css',
        'main': 'font-awesome.css'
      }
    );
  }
};
