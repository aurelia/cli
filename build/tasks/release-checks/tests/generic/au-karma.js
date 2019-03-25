const Test = require('../test');
const ExecuteCommand = require('../../tasks/execute-command');

class AuKarmaRunsTests extends Test {
  constructor() {
    super('au test runs karma tests');
  }

  onOutput(message) {
    this.logger.debug(message);

    if (isTestFinishedMessage(message)) {
      this.success();
      this.executeCommand.stop();
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('au', ['test'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

function isTestFinishedMessage(msg) {
  return /TOTAL: (.*) SUCCESS/.test(msg);
}

module.exports = {
  AuKarmaRunsTests
};
