'use strict';

const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.configureVisualStudioStructure()
    .configureDist(ProjectItem.directory('dist'))
    .configurePort(5000)
    .configureJavascriptServices()
    .configureDefaultSetup()
    .addToDevDependencies(
      'aspnet-webpack',
      'webpack-hot-middleware'
    )
    .addPostInstallProcess({
      command: 'dotnet',
      args: ['restore']
    });
};
