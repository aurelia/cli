'use strict';
const testSuites = require('./test-suites');
const LogManager = require('aurelia-logging');
const logger = LogManager.getLogger('Release-Check');
const CLIOptions = require('../../../lib/cli-options').CLIOptions;
const cliOptions = new CLIOptions();
const fs = require('fs');
const path = require('path');

let userArgs = process.argv.slice(2);
Object.assign(cliOptions, {
  args: userArgs.slice(1)
});

const ConsoleUI = require('../../../lib/ui').ConsoleUI;
const ui = new ConsoleUI();

module.exports = class MatchingTestSuiteSelector {

  getSubDirectories(dir) {
    if (!fs.existsSync(dir)) {
      throw new Error('The path does not exist');
    }

    // list all subdirectories in the provided directory
    const isDirectory = source => fs.lstatSync(source).isDirectory();
    const directories = fs.readdirSync(dir).map(name => path.join(dir, name)).filter(isDirectory);

    return directories;
  }

  match(subDirectories) {
    const suites = [];

    for (const directoryPath of subDirectories) {
      const directoryName = path.basename(directoryPath);
      const suite = testSuites.find(x => x.title === directoryName);
      if (suite) {
        suite.dir = directoryPath;
        suites.push(suite);
      } else {
        logger.info(`Could not find test suite for ${directoryName}`);
      }
    }

    return Promise.resolve(suites);
  }

  determineDir() {
    if (cliOptions.hasFlag('path')) {
      return Promise.resolve(cliOptions.getFlagValue('path'));
    }

    return ui.question('Which directory contains all the projects to test?');
  }

  execute() {
    return this.determineDir()
    .then(dir => this.getSubDirectories(dir))
    .then(subDirectories => this.match(subDirectories))
    .then(suites => {
      // try and match the names of those directories to the title of a test suite
      if (suites.length === 0) {
        throw new Error('Could not match the name of any subdirectory to a test suite');
      }

      if (CLIOptions.hasFlag('all')) {
        return Promise.resolve(suites);
      }

      return this.askUserToPickSuites(suites);
    });
  }

  askUserToPickSuites(suites) {
    let options = suites.map(x => {
      return {
        displayName: x.title,
        suite: x
      };
    });
    options.push({
      displayName: 'all suites'
    });

    return ui.multiselect('Found test suites.\r\nWhich would you like to run?', options)
    .then(answers => {
      if (answers.find(x => x.displayName === 'all suites')) {
        return suites;
      }

      return answers.map(x => x.suite);
    });
  }
};
