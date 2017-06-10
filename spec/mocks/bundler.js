'use strict';

const Configuration = require('../../lib/configuration').Configuration;

module.exports = class Bundler {
  constructor() {
    this.itemIncludedInBuild = jasmine.createSpy('itemIncludedInBuild');
    this.interpretBuildOptions = jasmine.createSpy('interpretBuildOptions');
    this.configureDependency = jasmine.createSpy('configureDependency');
    this.addFile = jasmine.createSpy('addFile');

    this.buildOptions  = new Configuration({}, {});
  }
};
