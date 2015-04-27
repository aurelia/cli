#!/usr/bin/env node

const Liftoff = require('liftoff');
const argv = require('minimist')(process.argv.slice(2));
const interface = require('../lib/interface');
const AureliaCLI = new Liftoff({
  name: 'aurelia-cli',
  configName: 'Aureliafile',
  extensions: require('interpret').jsVariants,
  // ^ automatically attempt to require module for any javascript variant
  // supported by interpret.  e.g. coffee-script / livescript, etc
  v8flags: ['--harmony'] // to support all flags: require('v8flags')
    // ^ respawn node with any flag listed here
}).on('require', function(name, module) {
  console.log('Loading:', name);
}).on('requireFail', function(name, err) {
  console.log('Unable to load:', name, err);
}).on('respawn', function(flags, child) {
  console.log('Detected node flags:', flags);
  console.log('Respawned to PID:', child.pid);
});

AureliaCLI.launch({
  cwd: argv.cwd,
  configPath: argv.aureliafile,
  require: argv.require,
  completion: argv.completion,
  verbose: argv.verbose
}, invoke);

function invoke(env) {
  if (argv.verbose) {
    console.log('LIFTOFF SETTINGS:', this);
    console.log('CLI OPTIONS:', argv);
    console.log('CWD:', env.cwd);
    console.log('LOCAL MODULES PRELOADED:', env.require);
    console.log('SEARCHING FOR:', env.configNameRegex);
    console.log('FOUND CONFIG AT:', env.configPath);
    console.log('CONFIG BASE DIR:', env.configBase);
    console.log('YOUR LOCAL MODULE IS LOCATED:', env.modulePath);
    console.log('LOCAL PACKAGE.JSON:', env.modulePackage);
    console.log('CLI PACKAGE.JSON', require('../package'));
  }

  if (process.cwd() !== env.cwd) {
    process.chdir(env.cwd);
    console.log('Working directory changed to', env.cwd);
  }

  if (!env.modulePath) {
    console.log('Local aurelia-cli not found in:', env.cwd);
    process.exit(1);
  }

  if (!env.configPath) {
    console.log('No Aureliafile found.');
  }

  // env.modulePath will export the existing instance.
  var _aurelia = require(env.modulePath);
  // Pass the existing instance into the env.configPath
  // Eventually we should avoid this logic, and allow the user to simply require('aurelia-cli')
  // and simply use the api without having to pass the instance in at this point.
  require(env.configPath)(_aurelia);

  // Pass the instance into our cli interface so that we can use it when specific commands are executed.
  interface(_aurelia);
}
