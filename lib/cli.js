"use strict";
const path = require('path');
const fs = require('fs');
const Container = require('aurelia-dependency-injection').Container;
const ui = require('./ui');

exports.CLIOptions = class {}

exports.CLI = class {
  constructor(options) {
    this.options = options || new exports.CLIOptions();
    this.container = new Container();
    this.ui = new ui.ConsoleUI();
    this.configureContainer();
  }

  run(commandName, commandArgs) {
    this.createCommand(commandName).then(command => {
      return command.execute(commandArgs);
    });
  }

  configureContainer() {
    this.container.registerInstance(exports.CLIOptions, this.options);
    this.container.registerInstance(ui.UI, this.ui);
  }

  createCommand(commandName) {
    return new Promise((resolve, reject) => {
      if (!commandName) {
        resolve(this.container.get(require('./commands/help/command')));
        return;
      }

      try {
        resolve(this.container.get(require(`./commands/${commandName}/command`)));
      } catch (e) {
        locateGulpCommand(commandName).then(commandPath => {
          if (commandPath) {
            Object.assign(this.options, {commandPath:commandPath});
            resolve(this.container.get(require(`./commands/gulp`)));
          } else {
            console.log(`Invalid Command Name: ${commandName}`);
            resolve(this.container.get(require('./commands/help/command')));
          }
        });
      }
    });
  }
}

function locateGulpCommand(command) {
  let current = process.cwd();
  let potential = path.join(current, `aurelia_project/tasks/${command}.js`);

  return new Promise((resolve, reject) => {
    fs.exists(potential, result => {
      if (result) {
        resolve(potential);
      } else {
        resolve(null);
      }
    });
  });
}
