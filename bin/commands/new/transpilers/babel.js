"use strict";
const ProjectItem = require('../project-item').ProjectItem;

module.exports = function(project) {
  project.addToSource(
    ProjectItem.resource('main.js', require.resolve('./resources/main.js')),
    ProjectItem.resource('app.js', require.resolve('./resources/app.js')),
    ProjectItem.resource('app.html', require.resolve('./resources/app.html'))
  );

  project.addToUnitTests(
    ProjectItem.resource('setup.js', require.resolve('./resources/setup.js'))
  );

  project.addToContent(
    ProjectItem.resource('.eslintrc', require.resolve('./resources/.eslintrc'))
  );
};
