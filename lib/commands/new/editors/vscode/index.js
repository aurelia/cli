"use strict";
const ItemTemplate = require('../../item-template').ItemTemplate;

module.exports = function(project) {
  if (project.model.transpiler === 'typescript') {
    project.addToContent(
      ItemTemplate.resource('tsconfig.json', require.resolve('./content/tsconfig.json'))
    );
  } else {
    project.addToContent(
      ItemTemplate.resource('jsconfig.json', require.resolve('./content/jsconfig.json'))
    );
  }
}
