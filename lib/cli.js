"use strict";
const path = require('path');
const fs = require('fs');

exports.CLI = class {
  run(commandName, commandArgs) {
    loadCommand(commandName).then(Command => {
      let command = new Command();
      return command.execute(commandArgs);
    });
  }
}

function loadCommand(commandName) {
  return new Promise((resolve, reject) => {
    if (!commandName) {
      resolve(require('./commands/help/command').Command);
      return;
    }

    try {
      resolve(require(`./commands/${commandName}/command`).Command);
    } catch (e) {
      findGulpCommand(commandName).then(command => {
        if (command) {
          resolve(command);
        } else {
          console.log(`Invalid Command Name: ${commandName}`);
          resolve(require('./commands/help/command').Command);
        }
      });
    }
  });
}

function findGulpCommand(command) {
  let current = process.cwd();
  let potential = path.join(current, `aurelia_project/tasks/${command}.js`);

  return new Promise((resolve, reject) => {
    fs.exists(potential, result => {
      if (result) {
        
      } else {
        resolve(null);
      }
    });
  });
}
