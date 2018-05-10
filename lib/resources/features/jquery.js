'use strict';
const ProjectItem = require('../../project-item').ProjectItem;

module.exports = function (project, model, options) {
  project.addToDependencies(
    'jquery@^2.2.4',
  );
  // if (model.bundler.id !== 'webpack') {
  //   project.addToAureliaDependencies(
  //     'jquery'
  //   );
  // }
};
