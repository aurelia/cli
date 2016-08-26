#!/usr/bin/env node
"use strict";
const resolve = require('../lib/resolve');

process.title = 'aurelia';

let originalBaseDir = process.cwd();

resolve('aurelia-cli', {
  basedir: originalBaseDir
}, function(error, projectLocalCli) {
  let cli;

  if (error) {
    cli = new (require('../lib/index').CLI);
    cli.options.runningGlobally = true;
  } else {
    cli = new (require(projectLocalCli).CLI);
    cli.options.runningLocally = true;
  }

  cli.options.originalBaseDir = originalBaseDir;

  let userArgs = process.argv.slice(2);
  let commandName = userArgs[0];
  let commandArgs = userArgs.slice(1);

  cli.run(commandName, commandArgs).catch((error) => {
      console.log(error);
      process.exit(1);
  });
});
