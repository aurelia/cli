#!/usr/bin/env node
"use strict";

let userArgs = process.argv.slice(2);
let commandName = userArgs[0];
let commandArgs = userArgs.slice(1);

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
