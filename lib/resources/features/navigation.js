'use strict';
const ProjectItem = require('../../project-item').ProjectItem;

module.exports = function (project, model, options) {
    project.addFeature('aureliaFetchClient', project, model, options);
    project.addFeature('bootstrap', project, model, options);
    project.addFeature('fontAwesome', project, model, options);
  
    let baseDir = (model.bundler.id !== 'webpack' ? model.platform.baseDir.substring(1) : '');
    if (baseDir.length) {
        baseDir += '/';
    }
    project.addToSource(
        ProjectItem.resource('blur-image.ext', 'features/navigation/blur-image.ext', model.transpiler),
        ProjectItem.resource('child-router.html', 'features/navigation/child-router.html', model.transpiler),
        ProjectItem.resource('child-router.ext', 'features/navigation/child-router.ext', model.transpiler)
            .asTemplate(model),
        ProjectItem.resource('nav-bar.html', 'features/navigation/nav-bar.html', model.transpiler),
        ProjectItem.resource('users.html', 'features/navigation/users.html', model.transpiler)
            .asTemplate(model, { type: model.markupProcessor }),
        ProjectItem.resource('users.ext', 'features/navigation/users.ext', model.transpiler),
        ProjectItem.resource('welcome.html', 'features/navigation/welcome.html', model.transpiler),
        ProjectItem.resource('welcome.ext', 'features/navigation/welcome.ext', model.transpiler),
    ).addToContent(
        ProjectItem.resource(baseDir + 'styles/styles.css', 'features/navigation/styles.css', model.transpiler),
    ).addToDependencies(
        'aurelia-animator-css@^1.0.0'
    );
    if (model.bundler.id !== 'webpack') {
        project.addToAureliaDependencies(
            'aurelia-animator-css'
        );
    }
};
