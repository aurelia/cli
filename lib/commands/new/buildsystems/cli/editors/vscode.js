'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  if (project.model.transpiler.id !== 'typescript') {
    project.addToContent(
      ProjectItem.resource('jsconfig.json', 'content/jsconfig.json')
    );
  } else {
    project.addToContent(
      ProjectItem.directory('.vscode').add(
        ProjectItem.resource('settings.json', 'content/settings.json')
      )
    );
  }

  // add suggested extensions and launch debugger to all bundler type
  project.addToContent(
    ProjectItem.directory('.vscode').add(
      ProjectItem.resource('extensions.json', 'content/extensions.json'),
      ProjectItem.resource('launch.json', 'content/launch-cli.json')
    )
  );
};
