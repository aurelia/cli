'use strict';

module.exports = function(project) {
  let model = project.model;

  Object.assign(model.platform, {
    port: 8080,
    hmr: true,
    open: false
  });

  const configurePlatform = require(`./${model.platform.id}`);
  configurePlatform(project);
};
