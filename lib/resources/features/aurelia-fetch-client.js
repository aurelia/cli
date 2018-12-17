'use strict';

module.exports = function (project, model) {
  project.addToDependencies(
    'whatwg-fetch@^2.0.3',
    'aurelia-fetch-client@^1.0.0'
  );
  if (model.bundler.id !== 'webpack') {
    project.addToAureliaDependencies(
      'aurelia-fetch-client'
    ).addToAureliaPrepend(
      'node_modules/whatwg-fetch/fetch.js'
    );
  }
};
