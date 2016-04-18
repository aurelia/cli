#!/usr/bin/env node
"use strict";
const resolve = require('../lib/resolve');

process.title = 'aurelia';

resolve('aurelia-cli', {
  basedir: process.cwd()
}, function(error, projectLocalCli) {
  let cli;

  if (error) {
    cli = new (require('../lib/index').CLI);
    cli.options.runningGlobally = true;
  } else {
    cli = new (require(projectLocalCli).CLI);
    cli.options.runningLocally = true;
  }

  let userArgs = process.argv.slice(2);
  let commandName = userArgs[0];
  let commandArgs = userArgs.slice(1);

  cli.run(commandName, commandArgs);
});
