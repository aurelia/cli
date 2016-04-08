#!/usr/bin/env node
"use strict";

let userArgs = process.argv.slice(2);
let commandName = userArgs[0];
let commandArgs = userArgs.slice(1);

switch (commandName) {
  case 'new':
    const NewCommand = require('./commands/new/command').Command;
    new NewCommand().execute(commandArgs);
    break;
  default:
    console.log('help');
    break;
}
