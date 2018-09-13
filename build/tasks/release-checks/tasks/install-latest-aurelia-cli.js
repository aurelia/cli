'use strict';
const Task = require('./task');
const Yarn = require('../../../../lib/package-managers/yarn').Yarn;
const LogManager = require('aurelia-logging');
const logger = LogManager.getLogger('link-aurelia-cli');
const StepRunner = require('../step-runner');
const ExecuteCommand = require('./execute-command');
const ConsoleUI = require('../../../../lib/ui').ConsoleUI;
const CLIOptions = require('../../../../lib/cli-options').CLIOptions;
const cliOptions = new CLIOptions();
const ui = new ConsoleUI();

let userArgs = process.argv.slice(2);
Object.assign(cliOptions, {
  args: userArgs.slice(1)
});

module.exports = class InstallLatestAureliaCLI extends Task {
  constructor() {
    super('Install latest Aurelia-CLI');
  }

  onOutput(message) {
    this.logger.debug(message);
  }

  determineURL() {
    if (cliOptions.hasFlag('latest-cli-url')) {
      return Promise.resolve(cliOptions.getFlagValue('latest-cli-url'));
    }

    return ui.question('Git URL of Aurelia-CLI', 'https://github.com/aurelia/cli.git#master');
  }

  execute(context) {
    return this.determineURL()
    .then(forkUrl => {
      logger.debug('Install latest Aurelia-CLI (' + forkUrl + ') ' + context.workingDirectory);

      let yarn = new Yarn();

      const yarnPath = yarn.getExecutablePath(context.workingDirectory);

      const command = new ExecuteCommand(yarnPath, ['add', forkUrl, '-D'], (msg) => this.onOutput(msg));
      return new StepRunner(command).run();
    });
  }
};
