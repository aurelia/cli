const Test = require('../test');
const ExecuteCommand = require('../../tasks/execute-command');

class AuJestRunsTests extends Test {
  constructor() {
    super('au test runs jest tests');
  }

  onOutput(message) {
    this.logger.debug(message);

    if (isTestFinishedMessage(message)) {
      this.success();
      this.executeCommand.stop();
    }
  }

  execute() {
    // https://github.com/facebook/jest/issues/5064
    this.executeCommand = new ExecuteCommand('au', ['test'], (msg) => this.onOutput(msg), (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

function isTestFinishedMessage(msg) {
  return /(.*) passed, (.*) total/.test(msg);
}

module.exports = {
  AuJestRunsTests
};
