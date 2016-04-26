"use strict";
const path = require('path');
const fs = require('fs');
const Container = require('aurelia-dependency-injection').Container;
const ui = require('./ui');
const Project = require('./project').Project;

exports.CLIOptions = class {}

exports.CLI = class {
  constructor(options) {
    this.options = options || new exports.CLIOptions();
    this.container = new Container();
    this.ui = new ui.ConsoleUI();
    this.configureContainer();
  }

  run(commandName, commandArgs) {
    return this._establishProject(this.options)
      .then(project => {
        if (project) {
          this.project = project;
          this.container.registerInstance(Project, project);
        }

        return this.createCommand(commandName, commandArgs);
      }).then(command => command.execute(commandArgs));
  }

  configureContainer() {
    this.container.registerInstance(exports.CLIOptions, this.options);
    this.container.registerInstance(ui.UI, this.ui);
  }

  createCommand(commandName, commandArgs) {
    return new Promise((resolve, reject) => {
      if (!commandName) {
        resolve(this.createHelpCommand());
        return;
      }

      try {
        resolve(this.container.get(require(`./commands/${commandName}/command`)));
      } catch (e) {
        if (this.project) {
          this.project.resolveTask(commandName).then(taskPath => {
            if (taskPath) {
              Object.assign(this.options, {
                taskPath: taskPath,
                args: commandArgs
              });

              resolve(this.container.get(require(`./commands/gulp`)));
            } else {
              this.ui.log(`Invalid Command Name: ${commandName}`);
              resolve(this.createHelpCommand());
            }
          });
        } else {
          this.ui.log(`Invalid Command Name: ${commandName}`);
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

    return new Promise((resolve, reject) => {
      determineWorkingDirectory(process.cwd(), resolve, reject);
    }).then(dir => {
      if (dir) {
        process.chdir(dir);
        return new Project(dir);
      }

      this.ui.log('No Aurelia project found.');
    });
  }
}

function determineWorkingDirectory(dir, resolve, reject) {
  let parent = path.join(dir, '..');

  if (parent === dir) {
    resolve();
    return;
  }

  fs.exists(path.join(dir, 'aurelia_project'), result => {
    if (result) {
      resolve(dir);
    } else {
      determineWorkingDirectory(parent, resolve, reject);
    }
  });
}
