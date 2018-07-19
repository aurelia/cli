'use strict';
const Test = require('../test');
const ExecuteCommand = require('../../tasks/execute-command');

class AuTestRunsTests extends Test {
  constructor() {
    super('au test runs tests');
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
  return msg.indexOf('TOTAL: 1 SUCCESS') > -1;
}

module.exports = {
  AuTestRunsTests
};
