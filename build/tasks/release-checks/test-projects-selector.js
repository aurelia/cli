const CLIOptions = require('../../../lib/cli-options').CLIOptions;
const cliOptions = new CLIOptions();
const fs = require('../../../lib/file-system');
const path = require('path');
const _ = require('lodash');

let userArgs = process.argv.slice(2);
Object.assign(cliOptions, {
  args: userArgs.slice(1)
});

const ConsoleUI = require('../../../lib/ui').ConsoleUI;
const ui = new ConsoleUI();

module.exports = class TestProjectsSelector {
  getSubDirs(dir) {
    if (!fs.existsSync(dir)) {
      throw new Error('The path does not exist');
    }

    // list all subdirs in the provided directory
    const dirs = fs.readdirSync(dir)
      .filter(d => fs.isDirectory(path.join(dir, d)));

    return dirs;
  }

  async determineDir() {
    if (cliOptions.hasFlag('path')) {
      return cliOptions.getFlagValue('path');
    }

    return ui.question('Which directory contains all the projects to test?');
  }

  async execute() {
    const dir = await this.determineDir();
    let dirs = await this.getSubDirs(dir);

    if (dirs.length === 0) throw new Error('No subdirectory to test.');

    if (cliOptions.hasFlag('select')) {
      const selectedFeatures = cliOptions.getFlagValue('select').split(',');
      dirs = dirs.filter(d => {
        const features = d.split('_');
        return _.every(selectedFeatures, f => _.includes(features, f));
      });
    } else if (!cliOptions.hasFlag('all')) {
      dirs = await this.choose(dirs);
    }

    return {testDir: dir, dirs};
  }

  async choose(dirs) {
    let options = dirs.map(x => ({displayName: x}));
    options.unshift({displayName: 'All'});

    const answers = await ui.multiselect('Found test dirs.\r\nWhich would you like to run?', options);
    return answers.includes('All') ? dirs : answers;
  }
};
