"use strict";
const path = require('path');
const fs = require('fs');

exports.CLI = class {
  run(commandName, commandArgs) {
    createCommand(commandName).then(command => {
      return command.execute(commandArgs);
    });
  }
}

function createCommand(commandName) {
  return new Promise((resolve, reject) => {
    if (!commandName) {
      let Command = require('./commands/help/command').Command;
      resolve(new Command());
      return;
    }

    try {
      let Command = require(`./commands/${commandName}/command`).Command;
      resolve(new Command());
    } catch (e) {
      locateGulpCommand(commandName).then(commandPath => {
        if (commandPath) {
          let Command = require(`./commands/gulp`).Command;
          resolve(new Command(commandPath));
        } else {
          console.log(`Invalid Command Name: ${commandName}`);

          let Command = require('./commands/help/command').Command;
          resolve(new Command());
        }
      });
    }
  });
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
