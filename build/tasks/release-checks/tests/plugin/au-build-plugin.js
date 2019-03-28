const Test = require('../test');
const ExecuteCommand = require('../../tasks/execute-command');

class AuBuildPluginDoesNotThrowCommandLineErrors extends Test {
  constructor() {
    super('au build-plugin does not throw commandline errors');
  }

  onOutput(message) {
    this.debug(message);

    if (message.toLowerCase().indexOf('error') > -1) {
      this.executeCommand.stop();
      this.fail();
    } else if (isBuildCompletedMessage(message)) {
      this.success();
      this.executeCommand.stop();
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('au', ['build-plugin', '--watch'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

function isBuildCompletedMessage(msg) {
  return msg.indexOf('Finish building Aurelia plugin') > -1;
}

module.exports = {
  AuBuildPluginDoesNotThrowCommandLineErrors
};
