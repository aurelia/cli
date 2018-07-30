'use strict';

const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project, options) {
  let model = project.model;

  project.loader = model.loader.id;
  delete model.loader;

  model.build.loader = {
    type: 'system',
    configTarget: 'vendor-bundle.js',
    includeBundleMetadataInConfig: 'auto',
    plugins: [
      { name: 'text', extensions: ['.html', '.css'], stub: true }
    ]
  };

  let vendorBundle = model.build.bundles.find(x => x.name === 'vendor-bundle.js');
  vendorBundle.dependencies.push({
    name: 'text',
    path: '../node_modules/systemjs-plugin-text',
    main: 'text'
  });
  vendorBundle.prepend.push('node_modules/systemjs/dist/system.js');

  project.addToClientDependencies(
    'systemjs',
    'systemjs-plugin-text'
  ).addToContent(ProjectItem.resource('index.html', 'content/system.index.html'));
};
