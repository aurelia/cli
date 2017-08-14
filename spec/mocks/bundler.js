'use strict';

const Configuration = require('../../lib/configuration').Configuration;
const CLIOptions = require('../../lib/cli-options').CLIOptions;
const ProjectMock = require('./project-mock');

module.exports = class Bundler {
  constructor() {
    this.itemIncludedInBuild = jasmine.createSpy('itemIncludedInBuild');
    this.interpretBuildOptions = jasmine.createSpy('interpretBuildOptions');
    this.configureDependency = jasmine.createSpy('configureDependency');
    this.addFile = jasmine.createSpy('addFile');

    CLIOptions.instance = new CLIOptions();
    this.buildOptions  = new Configuration({}, {});
    this.project = new ProjectMock();
  }
};
