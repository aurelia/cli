'use strict';

const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function (project, options, target) {
  if (target === undefined) {
    project.configureDefaultStructure();
    project.configureDist(ProjectItem.directory('scripts'));
  }
  else {
    project.projectOutput.add(
      ProjectItem.resource('index.html', `content/${project.model.loader.id}.index.html`).askUserIfExists()
    );
    project.configureDefaultSetup();
    project.configureBuild(target)
  }
};
