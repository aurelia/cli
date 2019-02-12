let OriginalCLIOptions = require('../../lib/cli-options').CLIOptions;

module.exports = class CLIOptionsMock {
  constructor() {
    this.originalFns = {};
    if (!OriginalCLIOptions.instance) {
      // eslint-disable-next-line no-unused-vars
      let instance = new OriginalCLIOptions();
    }
  }

  attach() {
    this.originalFns.getEnvironment = OriginalCLIOptions.prototype.getEnvironment;
    OriginalCLIOptions.getEnvironment = jasmine.createSpy('getEnvironment');
  }

  detach() {
    OriginalCLIOptions.getEnvironment = this.originalFns.getEnvironment;
  }
};
