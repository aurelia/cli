'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.addToContent(
    ProjectItem.resource('tslint.json', 'content/tslint.json'),
    ProjectItem.resource('tsconfig.json', 'content/tsconfig.template.json')
      .asTemplate(project.model),
    ProjectItem.directory('custom_typings')
      .add(
        ProjectItem.resource('fetch.d.ts', 'content/custom_typings_webpack/fetch.d.ts'),
        ProjectItem.resource('system.d.ts', 'content/custom_typings_webpack/system.d.ts')
      )
  ).addToDevDependencies(
    'ts-loader',
    'ts-node',
    '@types/node',
    '@types/lodash',
    '@types/webpack',
    'typescript'
  );
};
