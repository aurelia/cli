#!/usr/bin/env node
"use strict";
const resolve = require('../lib/resolve');

process.title = 'aurelia';

resolve('aurelia-cli', {
  basedir: process.cwd()
}, function(error, projectLocalCli) {
  let CLI;

  if (error) {
    CLI = require('../lib/index').CLI;
  } else {
    CLI = require(projectLocalCli).CLI;
  }

  let userArgs = process.argv.slice(2);
  let commandName = userArgs[0];
  let commandArgs = userArgs.slice(1);

  new CLI().run(commandName, commandArgs);
});
