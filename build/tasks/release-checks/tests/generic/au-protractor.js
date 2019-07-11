const Test = require('../test');
const ExecuteCommand = require('../../tasks/execute-command');

class AuProtractorRunsTests extends Test {
  constructor() {
    super('au protractor runs tests');
  }

  onProtractorOutput(message) {
    this.debug(message);

    if (isProtractorCompletedMessage(message)) {
      this.success();
      this.executeCommand.stop();
      this.protractorCommand.stop();
    }
  }

  onOutput(message) {
    this.debug(message);

    if (isApplicationAvailableMessage(message) && !this.protractorCommand) {
      this.protractorCommand = new ExecuteCommand('au', ['protractor'], (msg) => this.onProtractorOutput(msg));
      this.protractorCommand.ignoreStdErr = true;
      return this.protractorCommand.executeAsNodeScript();
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('au', ['run'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

class AuProtractorRunsTestsDotNet extends Test {
  constructor() {
    super('au protractor (dotnet run) runs tests');
  }

  onProtractorOutput(message) {
    this.debug(message);

    if (isProtractorCompletedMessage(message)) {
      this.success();
      this.executeCommand.stop();
      this.protractorCommand.stop();
    }
  }

  onOutput(message) {
    this.debug(message);

    if (message.indexOf('Now listening on: http://') > -1 && !this.protractorCommand) {
      this.protractorCommand = new ExecuteCommand('au', ['protractor'], (msg) => this.onProtractorOutput(msg));
      this.protractorCommand.ignoreStdErr = true;
      return this.protractorCommand.executeAsNodeScript();
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('dotnet', ['run'], (msg) => this.onOutput(msg));
    return this.executeCommand.execute();
  }
}

function isApplicationAvailableMessage(msg) {
  return msg.indexOf('Application Available At: http://') > -1 ||
    msg.indexOf('Project is running at http://') > -1;
}

function isProtractorCompletedMessage(msg) {
  return msg.indexOf('specs, 0 failures') > -1;
}

module.exports = {
  AuProtractorRunsTests,
  AuProtractorRunsTestsDotNet
};
