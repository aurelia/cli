'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  let configureJasmine = require('./jasmine');
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
    'plugin-error',
    'aurelia-loader-nodejs',
    'aurelia-pal-nodejs'
  ).addNPMScript('test', 'au jest');

  if (project.model.transpiler.id === 'babel') {
    project.addToDevDependencies(
      'babel-jest',
      'babel-core@7.0.0-bridge.0'
    );

    project.package.jest = {
      modulePaths: [
        '<rootDir>/src',
        '<rootDir>/node_modules'
      ],
      moduleFileExtensions: [
        'js',
        'json'
      ],
      transform: {
        '^.+\\.js$': 'babel-jest'
      },
      testRegex: '\\.spec\\.js$',
      setupFiles: [
        '<rootDir>/test/jest-pretest.js'
      ],
      testEnvironment: 'node',
      collectCoverage: true,
      collectCoverageFrom: [
        'src/**/*.js',
        '!**/*.spec.js',
        '!**/node_modules/**',
        '!**/test/**'
      ],
      coverageDirectory: '<rootDir>/test/coverage-jest',
      coverageReporters: [
        'json',
        'lcov',
        'text',
        'html'
      ]
    };
  } else if (project.model.transpiler.id === 'typescript') {
    project.addToDevDependencies(
      'ts-jest',
      '@types/jest'
    );

    project.package.jest = {
      modulePaths: [
        '<rootDir>/src',
        '<rootDir>/node_modules'
      ],
      moduleFileExtensions: [
        'js',
        'json',
        'ts'
      ],
      transform: {
        '^.+\\.ts$': 'ts-jest'
      },
      testRegex: '\\.spec\\.(ts|js)$',
      setupFiles: [
        '<rootDir>/test/jest-pretest.ts'
      ],
      testEnvironment: 'node',
      collectCoverage: true,
      collectCoverageFrom: [
        'src/**/*.{js,ts}',
        '!**/*.spec.{js,ts}',
        '!**/node_modules/**',
        '!**/test/**'
      ],
      coverageDirectory: '<rootDir>/test/coverage-jest',
      coverageReporters: [
        'json',
        'lcov',
        'text',
        'html'
      ]
    };
  }
};
