"use strict";

exports.CLI = class {
  run(commandName, commandArgs) {
    if (commandName) {
      let Command;

      try {
        Command = require(`./commands/${commandName}/command`).Command;
      } catch (e) {
        console.log(`Invalid Command Name: ${commandName}`);
        Command = require('./commands/help/command').Command;
      }

      new Command().execute(commandArgs);
    } else {
      const HelpCommand = require('./commands/help/command').Command;
      new HelpCommand().execute(commandArgs);
    }
  }
}
