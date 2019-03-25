const Test = require('../test');
const ExecuteCommand = require('../../tasks/execute-command');

class AuCypressRunsTests extends Test {
  constructor() {
    super('au cypress runs tests');
  }

  onCypressOutput(message) {
    this.logger.debug(message);

    if (isCypressCompletedMessage(message)) {
      this.success();
      this.executeCommand.stop();
      this.cypressCommand.stop();
    } else if (isCypressFailedMessage(message)) {
      this.fail();
      this.executeCommand.stop();
      this.cypressCommand.stop();
    }
  }

  onOutput(message) {
    this.logger.debug(message);

    if (isApplicationAvailableMessage(message)) {
      this.cypressCommand = new ExecuteCommand('au', ['cypress', '--run'], (msg) => this.onCypressOutput(msg), (msg) => this.onCypressOutput(msg));
      return this.cypressCommand.executeAsNodeScript();
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('au', ['run'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

class AuCypressRunsTestsDotNet extends Test {
  constructor() {
    super('au cypress (dotnet run) runs tests');
  }

  onCypressOutput(message) {
    this.logger.debug(message);

    if (isCypressCompletedMessage(message)) {
      this.success();
      this.executeCommand.stop();
      this.cypressCommand.stop();
    } else if (isCypressFailedMessage(message)) {
      this.fail();
      this.executeCommand.stop();
      this.cypressCommand.stop();
    }
  }

  onOutput(message) {
    this.logger.debug(message);

    if (message.indexOf('Now listening on: http://localhost:') > -1) {
      this.cypressCommand = new ExecuteCommand('au', ['cypress'], (msg) => this.onCypressOutput(msg), (msg) => this.onCypressOutput(msg));
      return this.cypressCommand.executeAsNodeScript();
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('dotnet', ['run'], (msg) => this.onOutput(msg));
    return this.executeCommand.execute();
  }
}

function isApplicationAvailableMessage(msg) {
  return msg.indexOf('Application Available At: http://localhost') > -1 ||
    msg.indexOf('Project is running at http://localhost') > -1;
}

function isCypressCompletedMessage(msg) {
  return msg.indexOf('All specs passed') > -1;
}

function isCypressFailedMessage(msg) {
  return msg.indexOf('failed') > -1;
}

module.exports = {
  AuCypressRunsTests,
  AuCypressRunsTestsDotNet
};
