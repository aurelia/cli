#!/usr/bin/env node
'use strict';
const resolve = require('resolve');

const semver = require('semver');
const nodeVersion = process.versions.node;
if (semver.lt(nodeVersion, '8.9.0')) {
  console.error(`You are running Node.js v${nodeVersion}.
aurelia-cli requires Node.js v8.9.0 or above.
Please upgrade to latest Node.js https://nodejs.org`);
  process.exit(1);
}

process.title = 'aurelia';

const userArgs = process.argv.slice(2);
const commandName = userArgs[0];
const commandArgs = userArgs.slice(1);

let originalBaseDir = process.cwd();

resolve('aurelia-cli', {
  basedir: originalBaseDir
}, function(error, projectLocalCli) {
  let cli;

  if (commandName === 'new' || error) {
    cli = new (require('../lib/index').CLI);
    cli.options.runningGlobally = true;
  } else {
    cli = new (require(projectLocalCli).CLI);
    cli.options.runningLocally = true;
  }

  cli.options.originalBaseDir = originalBaseDir;

  cli.run(commandName, commandArgs).catch(err => {
    console.log(err);
    process.exit(1);
  });
});
