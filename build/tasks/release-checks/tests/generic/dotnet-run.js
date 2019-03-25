const Test = require('../test');
const ExecuteCommand = require('../../tasks/execute-command');
const CheckForJavascriptErrors = require('../../tasks/check-javascript-errors');
const TakeScreenShotOfPage = require('../../tasks/take-screenshot-of-page');
const StepRunner = require('../../step-runner');
const path = require('path');

class DotNetRunDoesNotThrowCommandLineErrors extends Test {
  constructor() {
    super('dotnet run does not throw commandline errors');
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
    this.executeCommand = new ExecuteCommand('dotnet', ['run'], (msg) => this.onOutput(msg));
    return this.executeCommand.execute();
  }
}

class DotNetRunLaunchesServer extends Test {
  constructor() {
    super('dotnet run launches server');
  }

  onOutput(message) {
    this.logger.debug(message);

    if (isApplicationAvailableMessage(message)) {
      this.success();
      this.executeCommand.stop();
    }
  }

  execute() {
    this.executeCommand = new ExecuteCommand('dotnet', ['run'], (msg) => this.onOutput(msg));
    return this.executeCommand.execute();
  }
}

class DotnetRunRendersPage extends Test {
  constructor() {
    super('dotnet run renders page');
  }

  onOutput(context, message) {
    this.logger.debug(message);

    if (isApplicationAvailableMessage(message)) {
      const url = getURL(message);

      const screenshot = new TakeScreenShotOfPage(url, path.join(context.resultOutputFolder, 'screenshot-of-dotnet-run.png'));

      return new StepRunner(screenshot).run()
      .then(() => {
        this.success();
        this.executeCommand.stop();
      });
    }
  }

  execute(context) {
    this.executeCommand = new ExecuteCommand('dotnet', ['run'], (msg) => this.onOutput(context, msg));
    return this.executeCommand.execute();
  }
}

class DotNetRunAppLaunchesWithoutJavascriptErrors extends Test {
  constructor() {
    super('dotnet run app launches without javascript errors');
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
    this.executeCommand = new ExecuteCommand('dotnet', ['run'], (msg) => this.onOutput(msg));
    return this.executeCommand.execute();
  }
}

function isApplicationAvailableMessage(msg) {
  return msg.indexOf('Now listening on: http://localhost:') > -1;
}

function getURL(msg) {
  const regex = /Now listening on: http:\/\/(.*)/;
  const match = regex.exec(msg);
  return 'http://' + match[1];
}

module.exports = {
  DotNetRunDoesNotThrowCommandLineErrors,
  DotNetRunLaunchesServer,
  DotnetRunRendersPage,
  DotNetRunAppLaunchesWithoutJavascriptErrors
};

