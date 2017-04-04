'use strict';

module.exports = class Bundler {
  constructor() {
    this.itemIncludedInBuild = jasmine.createSpy('itemIncludedInBuild');
    this.interpretBuildOptions = jasmine.createSpy('interpretBuildOptions');
    this.configureDependency = jasmine.createSpy('configureDependency');
    this.addFile = jasmine.createSpy('addFile');
  }
};
