#!/usr/bin/env node
"use strict";
const resolve = require('../lib/resolve');

process.title = 'aurelia';

resolve('aurelia-cli', {
  basedir: process.cwd()
}, function(error, projectLocalCli) {
  let CLI;
  let options = {};

  if (error) {
    options.runningGlobally = true;
    CLI = require('../lib/index').CLI;
  } else {
    options.runningLocally = true;
    CLI = require(projectLocalCli).CLI;
  }

  let userArgs = process.argv.slice(2);
  let commandName = userArgs[0];
  let commandArgs = userArgs.slice(1);

  new CLI(options).run(commandName, commandArgs);
});
