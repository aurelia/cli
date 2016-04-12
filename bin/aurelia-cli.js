#!/usr/bin/env node
"use strict";
const CLI = require('../lib/cli').CLI;

process.title = 'aurelia';

let userArgs = process.argv.slice(2);
let commandName = userArgs[0];
let commandArgs = userArgs.slice(1);

new CLI().run(commandName, commandArgs);
