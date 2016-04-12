#!/usr/bin/env node
"use strict";
process.title = 'aurelia';

let userArgs = process.argv.slice(2);
let commandName = userArgs[0];
let commandArgs = userArgs.slice(1);

let CLI;

try {
  let location = require.resolve('aurelia-cli');
  CLI = require(location).CLI;
} catch (e) {
  CLI = require('../lib/cli').CLI;
}

new CLI().run(commandName, commandArgs);
