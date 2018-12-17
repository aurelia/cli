'use strict';

module.exports = function (project, model) {
  const baseDir = (model.bundler.id !== 'webpack' ? model.platform.baseDir : 'dist');

  project.addToDependencies(
    'font-awesome@4.6.3'
  );
  if (model.bundler.id !== 'webpack') {
    project.addToCopyFiles({
      'node_modules/font-awesome/fonts/*': baseDir + '/font-awesome/fonts'
    });
  }
};
