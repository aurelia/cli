"use strict";
const ItemTemplate = require('../../item-template').ItemTemplate;

module.exports = function(project) {
  project.addToContent(
    ItemTemplate.directory('styles')
  ).addToTasks(
    ItemTemplate.resource('build-styles.js', require.resolve('./tasks/build-styles.js'))
  );
};
