'use strict';
const ProjectItem = require('../../project-item').ProjectItem;

module.exports = function (project, model, options) {
    project.addToDependencies(
        'whatwg-fetch@^2.0.3',
        'aurelia-fetch-client@^1.0.0'
    );
    if (model.bundler.id !== 'webpack') {
        project.addToAureliaDependencies(
            'aurelia-fetch-client',
            // 'whatwg-fetch'
        ).addToAureliaPrepend(
            'node_modules/whatwg-fetch/fetch.js'
        );
    }
};
