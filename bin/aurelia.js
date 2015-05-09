#!/usr/bin/env node
const Liftoff = require('liftoff');
const argv = require('minimist')(process.argv.slice(2));

const AureliaCLI = new Liftoff({
  name: 'aurelia-cli',
  configName: 'Aureliafile',
  extensions: require('interpret').jsVariants,
    // ^ automatically attempt to require module for any javascript variant
    // supported by interpret.  e.g. coffee-script / livescript, etc
    v8flags: ['--harmony'] // to support all flags: require('v8flags')
      // ^ respawn node with any flag listed here
    });

AureliaCLI
.on('require', function(name, module) {
  console.log('Loading:', name);
})

.on('requireFail', function(name, err) {
  console.log('Unable to load:', name, err);
})

.on('respawn', function(flags, child) {
  console.log('Detected node flags:', flags);
  console.log('Respawned to PID:', child.pid);
});

var cli = require('../lib/cli');

cli.configure({
  argv: argv,
  cwd: argv.cwd,
  configPath: argv.aureliafile,
  require: argv.require,
  completion: argv.completion,
  verbose: argv.verbose,
  Lyftoff: AureliaCLI,
  launchFile: 'lib/program.js'
});
