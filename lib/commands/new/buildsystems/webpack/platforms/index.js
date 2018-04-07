'use strict';

module.exports = function(project) {
  let model = project.model;

  Object.assign(model.platform, {
    hmr: false,
    open: false
  });

  const configurePlatform = require(`./${model.platform.id}`);
  configurePlatform(project);
};
