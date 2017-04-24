'use strict';

let OriginalCLIOptions = require('../../lib/cli-options').CLIOptions;

module.exports = class CLIOptionsMock {

  constructor() {
    this.originalFns = {};
  }

  attach() {
    this.originalFns.getEnvironment = OriginalCLIOptions.prototype.getEnvironment;
    OriginalCLIOptions.getEnvironment = jasmine.createSpy('getEnvironment');
  }

  detach() {
    OriginalCLIOptions.getEnvironment = this.originalFns.getEnvironment;
  }
};
