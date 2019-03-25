const Test = require('../test');
const ExecuteCommand = require('../../tasks/execute-command');
const path = require('path');
const fs = require('fs');

class AuBuildDoesNotThrowCommandLineErrors extends Test {
  constructor() {
    super('au build does not throw commandline errors');
  }

  onOutput(message) {
    this.logger.debug(message);

    if (message.toLowerCase().indexOf('error') > -1) {
      this.executeCommand.stop();
      this.fail();
    } else if (isBuildCompletedMessage(message)) {
      this.success();
      this.executeCommand.stop();
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('au', ['build', '--watch'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

class AuBuildWatchPicksUpFileChanges extends Test {
  constructor(fileToChange) {
    super('au build --watch picks up file changes');

    this.fileToChange = fileToChange || path.join('src', 'app.html');
  }

  changeFile() {
    return new Promise(resolve => {
      const fullPath = path.join(this.context.workingDirectory, this.fileToChange);

      this.logger.debug(`changing file ${fullPath}`);

      fs.readFile(fullPath, 'utf-8', (err, data) => {
        if (err) {
          throw err;
        }

        fs.writeFile(fullPath, data + ' ', 'utf-8', (error) => {
          if (error) {
            throw error;
          }

          resolve();
        });
      });
    });
  }

  onOutput(message) {
    this.logger.debug(message);

    if (isBuildCompletedMessage(message)) {
      setTimeout(() => this.changeFile(), 1000);
    }

    if (message.indexOf('to pending build changes') > -1) {
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
  return msg.indexOf('Finished \'writeBundles\'') > -1;
}

module.exports = {
  AuBuildDoesNotThrowCommandLineErrors,
  AuBuildWatchPicksUpFileChanges
};
