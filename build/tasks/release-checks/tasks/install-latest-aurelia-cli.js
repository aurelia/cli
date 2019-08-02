const Task = require('./task');
const NPM = require('../../../../dist/package-managers/npm').NPM;
const LogManager = require('aurelia-logging');
const logger = LogManager.getLogger('link-aurelia-cli');
const CLIOptions = require('../../../../dist/cli-options').CLIOptions;
const cliOptions = new CLIOptions();
const ConsoleUI = require('../../../../dist/ui').ConsoleUI;
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

  async determineURL() {
    if (cliOptions.hasFlag('latest-cli-url')) {
      return cliOptions.getFlagValue('latest-cli-url');
    }

    return await ui.question(
      'Git URL of targeted Aurelia-CLI',
      'aurelia/cli#master'
    );
  }

  async execute(context) {
    const forkUrl = await this.determineURL();
    logger.debug('Install latest Aurelia-CLI (' + forkUrl + ') ' + context.workingDirectory);

    const npm = new NPM();
    return npm.install([forkUrl], context.workingDirectory);
  }
};
