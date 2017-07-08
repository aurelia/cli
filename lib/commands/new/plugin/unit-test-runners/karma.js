'use strict';
const ProjectItem = require('../../../../project-item').ProjectItem;

module.exports = function(project) {
  project.model.testFramework = {
    'id': 'jasmine',
    'displayName': 'Jasmine'
  };

  project.addToTasks(
    ProjectItem.resource('test.ext', 'tasks/plugin/test.ext', project.model.transpiler),
    ProjectItem.resource('test.json', 'tasks/plugin/test.json')
  ).addToContent(
    project.tests.add(
      ProjectItem.resource('karma-bundle.js', `test/webpack/${project.model.transpiler.id}/karma-bundle.js`),
      ProjectItem.resource('karma.conf.js', 'test/plugin/karma.conf.js'),
      ProjectItem.resource('webpack.config.js', 'test/plugin/webpack.config.template.js')
        .asTemplate(project.model),

      project.unitTests.add(
        ProjectItem.resource(`${project.name}.spec.ext`, 'test/index.spec.template.ext', project.model.transpiler)
          .asTemplate({ name: project.name }),
        ProjectItem.resource('hello-world.spec.ext', 'test/hello-world.spec.ext', project.model.transpiler)
      )
    )
  ).addToDevDependencies(
    'aurelia-bootstrapper',
    'aurelia-pal-browser',
    'aurelia-polyfills',
    'aurelia-testing',
    'aurelia-tools',
    'aurelia-webpack-plugin',
    'css-loader',
    'expose-loader',
    'file-loader',
    'html-loader',
    'istanbul-instrumenter-loader',
    'jasmine-core',
    'jest-jasmine2',
    'jest-matchers',
    'json-loader',
    'karma',
    'karma-chrome-launcher',
    'karma-coverage',
    'karma-coverage-istanbul-reporter',
    'karma-jasmine',
    'karma-mocha-reporter',
    'karma-webpack',
    'style-loader',
    'url-loader',
    'webpack'
  );
};
