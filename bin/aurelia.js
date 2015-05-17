#!/usr/bin/env node
const argv     = require('minimist')(process.argv.slice(2));

var AureliaCLI = require('../AureliaCLI.js');

var cli = new AureliaCLI({
  name       : 'aurelia-cli',
  configName : 'Aureliafile',
  argv       : argv,
  cwd        : argv.cwd,
  verbose    : argv.verbose,
  launchFile : 'lib/program.js',
  extensions : require('interpret').jsVariants,
  //   // ^ automatically attempt to require module for any javascript variant
  //   // supported by interpret.  e.g. coffee-script / livescript, etc
  v8flags: ['--harmony'] // to support all flags: require('v8flags')
  //   // ^ respawn node with any flag listed here
});

process.title = cli.processTitle;
process.AURELIA = cli;

cli.launch()
