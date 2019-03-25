const Test = require('../test');
const ExecuteCommand = require('../../tasks/execute-command');

class AuLintFinishes extends Test {
  constructor() {
    super('au lint finishes');
  }

  onOutput(message) {
    this.logger.debug(message);

    if (isTestFinishedMessage(message)) {
      this.success();
      this.executeCommand.stop();
    }
    if (isErrorMessage(message)) {
      this.fail();
      this.executeCommand.stop();
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('au', ['lint'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

function isTestFinishedMessage(msg) {
  return msg.indexOf('Finished \'lint\'') > -1;
}

function isErrorMessage(msg) {
  return msg.indexOf('error') > -1;
}

module.exports = {
  AuLintFinishes
};
