'use strict';

const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project, options) {
  let model = project.model;

  project.loader = model.loader.id;
  delete model.loader;

  model.build.loader = {
    type: 'require',
    configTarget: 'vendor-bundle.js',
    includeBundleMetadataInConfig: 'auto',
    plugins: [
      { name: 'text', extensions: ['.html', '.css'], stub: true }
    ]
  };

  let vendorBundle = model.build.bundles.find(x => x.name === 'vendor-bundle.js');
  vendorBundle.dependencies.push('text');
  vendorBundle.prepend.push('node_modules/requirejs/require.js');

  project.addToClientDependencies(
    'requirejs',
    'text'
  )
  .addToContent(ProjectItem.resource('index.html', 'content/index.template.html')
      .asTemplate(model, { type: model.markupProcessor })
  );
};
