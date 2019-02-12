const Test = require('../test');
const ExecuteCommand = require('../../tasks/execute-command');

class AuCypressRunsTests extends Test {
  constructor() {
    super('au cypress runs tests');
  }

  onCypressOutput(message) {
    console.log(message);
    if (isCypressCompletedMessage(message)) {
      this.success();
      this.executeCommand.stop();
      this.cypressCommand.stop();
    }
  }

  onOutput(message) {
    this.logger.debug(message);

    if (isApplicationAvailableMessage(message)) {
      this.cypressCommand = new ExecuteCommand('au', ['cypress', '--run'], (msg) => this.onCypressOutput(msg));
      this.cypressCommand.ignoreStdErr = true;
      return this.cypressCommand.executeAsNodeScript();
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('au', ['run'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

function isApplicationAvailableMessage(msg) {
  return msg.indexOf('Project is running at http://localhost') > -1;
}

function isCypressCompletedMessage(msg) {
  return msg.indexOf('All specs passed') > -1;
}

module.exports = {
  AuCypressRunsTests
};
