'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  const isUsingBabel = project.model.transpiler.id === 'babel';
  const isUsingTS = project.model.transpiler.id === 'typescript';
  const configureJasmine = require('./jasmine');

  configureJasmine(project);

  project.addToTasks(
    ProjectItem.resource('jest.ext', 'tasks/jest.ext', project.model.transpiler),
    ProjectItem.resource('jest.json', 'tasks/jest.json')
  ).addToContent(
    project.tests.add(
      ProjectItem.resource('jest-pretest.ext', 'test/jest-pretest.ext', project.model.transpiler)
    )
  ).addToDevDependencies(
    'jest',
    'jest-cli',
    'jest-transform-stub',
    'aurelia-loader-nodejs',
    'aurelia-pal-nodejs'
  ).addNPMScript('test', 'au jest');

  const transform = {
    '^.+\\.(css|less|sass|scss|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  };

  const moduleFileExtensions = ['js', 'json'];
  const setupFiles = [];
  const collectCoverageFrom = [ '!**/node_modules/**', '!**/test/**' ];
  let testRegex = '\\.spec\\.';

  if (isUsingBabel) {
    project.addToDevDependencies(
      'babel-jest',
      'babel-core@7.0.0-bridge.0'
    );

    transform['^.+\\.js$'] = 'babel-jest';
    testRegex += 'js$';
    setupFiles.push('<rootDir>/test/jest-pretest.js');
    collectCoverageFrom.push( 'src/**/*.js', '!**/*.spec.js');
  } else if (isUsingTS) {
    project.addToDevDependencies(
      'ts-jest',
      '@types/jest'
    );

    transform['^.+\\.ts$'] = 'ts-jest';
    moduleFileExtensions.push('ts');
    testRegex += '(ts|js)$';
    setupFiles.push('<rootDir>/test/jest-pretest.ts');
    collectCoverageFrom.push( 'src/**/*.{js,ts}', '!**/*.spec.{js,ts}');
  }

  project.package.jest = {
    moduleNameMapper: {
      // avoid aurelia-bindings v1+v2 conflict
      '^aurelia-binding$': '<rootDir>/node_modules/aurelia-binding'
    },
    modulePaths: [
      '<rootDir>/src',
      '<rootDir>/node_modules'
    ],
    moduleFileExtensions,
    transform,
    testRegex,
    setupFiles,
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom,
    coverageDirectory: '<rootDir>/test/coverage-jest',
    coverageReporters: [ 'json', 'lcov', 'text', 'html']
  };
};
