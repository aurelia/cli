'use strict';
const path = require('path');
const Container = require('aurelia-dependency-injection').Container;
const fs = require('./file-system');
const ui = require('./ui');
const Project = require('./project').Project;
const CLIOptions = require('./cli-options').CLIOptions;
const LogManager = require('aurelia-logging');
const Logger = require('./logger').Logger;

exports.CLI = class {
  constructor(options) {
    this.options = options || new CLIOptions();
    this.container = new Container();
    this.ui = new ui.ConsoleUI(this.options);
    this.configureContainer();
  }

  run(cmd, args) {
    if (cmd === '--version' || cmd === '-v') {
      return this.ui.log(require('../package.json').version);
    }

    return this._establishProject(this.options)
      .then(project => {
        if (project) {
          this.project = project;
          this.container.registerInstance(Project, project);
        }

        return this.createCommand(cmd, args);
      })
      .then((command) => {
        this.configureLogger();

        return command.execute(args);
      });
  }

  configureLogger() {
    LogManager.addAppender(this.container.get(Logger));
    let level = CLIOptions.hasFlag('debug') ? LogManager.logLevel.debug : LogManager.logLevel.info;
    LogManager.setLevel(level);
  }

  configureContainer() {
    this.container.registerInstance(CLIOptions, this.options);
    this.container.registerInstance(ui.UI, this.ui);
  }

  createCommand(commandText, commandArgs) {
    return new Promise((resolve, reject) => {
      if (!commandText) {
        resolve(this.createHelpCommand());
        return;
      }

      let parts = commandText.split(':');
      let commandModule = parts[0];
      let commandName = parts[1] || 'default';

      try {
        let alias = require('./commands/alias.json')[commandModule];
        let found = this.container.get(require(`./commands/${alias || commandModule}/command`));
        Object.assign(this.options, { args: commandArgs });
        resolve(found);
      } catch (e) {
        if (this.project) {
          this.project.resolveTask(commandModule).then(taskPath => {
            if (taskPath) {
              Object.assign(this.options, {
                taskPath: taskPath,
                args: commandArgs,
                commandName: commandName
              });

              resolve(this.container.get(require('./commands/gulp')));
            } else {
              this.ui.log(`Invalid Command: ${commandText}`);
              resolve(this.createHelpCommand());
            }
          });
        } else {
          this.ui.log(`Invalid Command: ${commandText}`);
          resolve(this.createHelpCommand());
        }
      }
    });
  }

  createHelpCommand() {
    return this.container.get(require('./commands/help/command'));
  }

  _establishProject(options) {
    if (!options.runningLocally) {
      return Promise.resolve();
    }

    return determineWorkingDirectory(process.cwd())
      .then(dir => dir ? Project.establish(this.ui, dir) : this.ui.log('No Aurelia project found.'));
  }
};

function determineWorkingDirectory(dir) {
  let parent = path.join(dir, '..');

  if (parent === dir) {
    return;
  }

  return fs.stat(path.join(dir, 'aurelia_project'))
    .then(() => dir)
    .catch(() => determineWorkingDirectory(parent));
}

process.on('unhandledRejection', (reason) => {
  console.log('Uncaught promise rejection:');
  console.log(reason);
});
