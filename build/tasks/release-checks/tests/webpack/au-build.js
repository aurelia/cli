const Test = require('../test');
const ExecuteCommand = require('../../tasks/execute-command');
const path = require('path');
const fs = require('fs');

class AuBuildDoesNotThrowCommandLineErrors extends Test {
  constructor() {
    super('au build does not throw commandline errors');
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
    this.executeCommand = new ExecuteCommand('au', ['build'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

class AuBuildStartsWebpackInWatchMode extends Test {
  constructor(fileToChange) {
    super('au build --watch starts webpack in watch mode');

    this.fileToChange = fileToChange || path.join('src', 'app.html');
    this.firstBuildCompleted = false;
  }

  onOutput(message) {
    this.debug(message);

    if (message.toLowerCase().indexOf('error') > -1) {
      this.executeCommand.stop();
      this.fail();
    } else if (message.indexOf('webpack is watching the files') > -1) {
      this.success();
      this.executeCommand.stop();
    }
  }

  execute(context) {
    this.context = context;

    this.executeCommand = new ExecuteCommand('au', ['build', '--watch'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

function isBuildCompletedMessage(msg) {
  return msg.indexOf('Built at') > -1;
}

module.exports = {
  AuBuildDoesNotThrowCommandLineErrors,
  AuBuildStartsWebpackInWatchMode
};
