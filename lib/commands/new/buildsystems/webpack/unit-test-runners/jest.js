'use strict';
const ProjectItem = require('../../../../../project-item').ProjectItem;

module.exports = function(project) {
  let configureJasmine = require('./jasmine');
  configureJasmine(project);

  let transpilerId = project.model.transpiler.id;
  let testContentRoot = `test/webpack/${transpilerId}`;

  project.addToTasks(
    ProjectItem.resource('jest.ext', 'tasks/jest.ext', project.model.transpiler),
    ProjectItem.resource('jest.json', 'tasks/jest.json')
  ).addToContent(
    project.tests.add(
      ProjectItem.resource('jest-pretest.ext', `${testContentRoot}/jest-pretest.ext`, project.model.transpiler)
    )
  ).addToDevDependencies(
    'jest',
    'jest-cli',
    'gulp-util',
    'aurelia-loader-nodejs',
    'aurelia-pal-nodejs'
  );

  if (project.model.transpiler.id === 'babel') {
    project.addToDevDependencies(
      'babel-jest'
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
        '^.+\\.jsx?$': 'babel-jest'
      },
      testRegex: '\\.spec\\.(ts|js)x?$',
      setupFiles: [
        '<rootDir>/test/jest-pretest.js'
      ],
      testEnvironment: 'node',
      moduleNameMapper: {
        'aurelia-(.*)': '<rootDir>/node_modules/$1'
      },
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
        '^.+\\.(ts|tsx)$': '<rootDir>/node_modules/ts-jest/preprocessor.js'
      },
      testRegex: '\\.spec\\.(ts|js)x?$',
      setupFiles: [
        '<rootDir>/test/jest-pretest.ts'
      ],
      testEnvironment: 'node',
      moduleNameMapper: {
        'aurelia-(.*)': '<rootDir>/node_modules/$1'
      },
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
      ],
      mapCoverage: true
    };
  }
};
