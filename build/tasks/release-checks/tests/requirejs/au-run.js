const Test = require('../test');
const ExecuteCommand = require('../../tasks/execute-command');
const CheckForJavascriptErrors = require('../../tasks/check-javascript-errors');
const TakeScreenShotOfPage = require('../../tasks/take-screenshot-of-page');
const StepRunner = require('../../step-runner');
const path = require('path');
const fs = require('fs');

class AuRunDoesNotThrowCommandLineErrors extends Test {
  constructor() {
    super('au run does not throw commandline errors');
  }

  onOutput(message) {
    this.logger.debug(message);

    if (message.toLowerCase().indexOf('error') > -1) {
      this.executeCommand.stop();
      this.fail();
    } else if (isApplicationAvailableMessage(message)) {
      this.success();
      this.executeCommand.stop();
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('au', ['run'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

class AuRunLaunchesServer extends Test {
  constructor() {
    super('au run launches server');
  }

  onOutput(message) {
    this.logger.debug(message);

    if (isApplicationAvailableMessage(message)) {
      this.success();
      this.executeCommand.stop();
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('au', ['run'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

class AuRunWatchPicksUpFileChanges extends Test {
  constructor(fileToChange) {
    super('au run picks up file changes');

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

    if (isApplicationAvailableMessage(message)) {
      setTimeout(() => this.changeFile(), 1000);
    }

    if (message.indexOf('to pending build changes') > -1) {
      this.success();
      this.executeCommand.stop();
    }
  }

  execute(context) {
    this.context = context;

    this.executeCommand = new ExecuteCommand('au', ['run'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

class AuRunAppLaunchesWithoutJavascriptErrors extends Test {
  constructor() {
    super('au run app launches without javascript errors');
  }

  onOutput(message) {
    this.logger.debug(message);

    if (isApplicationAvailableMessage(message)) {
      const url = getURL(message);

      const checkJavascriptErrorsTask = new CheckForJavascriptErrors(url);

      return new StepRunner(checkJavascriptErrorsTask).run()
        .then(() => {
          this.success();
          this.executeCommand.stop();
        });
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('au', ['run'], (msg) => this.onOutput(msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

class AuRunRendersPage extends Test {
  constructor() {
    super('au run renders page');
  }

  onOutput(context, message) {
    this.logger.debug(message);

    if (isApplicationAvailableMessage(message)) {
      const url = getURL(message);

      const screenshot = new TakeScreenShotOfPage(url, path.join(context.resultOutputFolder, 'screenshot-of-au-run.png'));

      return new StepRunner(screenshot).run()
        .then(() => {
          this.success();
          this.executeCommand.stop();
        });
    }
  }

  execute(context) {
    this.executeCommand = new ExecuteCommand('au', ['run'], (msg) => this.onOutput(context, msg));
    return this.executeCommand.executeAsNodeScript();
  }
}

function isApplicationAvailableMessage(msg) {
  return msg.indexOf('Application Available At: http://localhost') > -1;
}

function getURL(msg) {
  const regex = /Application Available At: (.*)/;
  const match = regex.exec(msg);
  return match[1];
}

module.exports = {
  AuRunDoesNotThrowCommandLineErrors,
  AuRunLaunchesServer,
  AuRunAppLaunchesWithoutJavascriptErrors,
  AuRunRendersPage,
  AuRunWatchPicksUpFileChanges
};
