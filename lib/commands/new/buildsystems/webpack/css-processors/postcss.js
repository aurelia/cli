'use strict';

module.exports = function(project) {
  project.addToDevDependencies(
    'postcss-loader',
    'autoprefixer'
  );
};
