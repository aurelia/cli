'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToContent(
    ProjectItem.directory('.vscode').add(
      ProjectItem.resource('settings.json', 'content/settings.json'),
      ProjectItem.resource('extensions.json', 'content/extensions.json'),
      ProjectItem.resource('launch.json', 'content/launch.json')
    )
  );
};
