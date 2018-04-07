'use strict';

const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.configureVisualStudioStructure();
  project.configureDist(ProjectItem.directory('scripts'));
  project.configurePort(5000);
  project.projectOutput.add(
    ProjectItem.resource('index.html', `content/${project.model.loader.id}.index.html`).askUserIfExists()
  );
  project.configureDefaultSetup();
};
