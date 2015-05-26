#!/usr/bin/env node --harmony

var Liftoff = require('liftoff');
var argv = require('minimist')(process.argv.slice(2));
var logger = require('winston');

process.env.INIT_CWD = process.cwd();
var DEV_ENV = parseInt(process.env.AURELIA_CLI_DEV_ENV, 10);

const cli = new Liftoff({
  name: 'aurelia-cli',
  configName: 'Aureliafile'
});


var failed = false;
process.once('exit', function(code) {
  if (code === 0 && failed) {
    process.exit(1);
  }
});

var cliPackage = require('../package');
var versionFlag = argv.v || argv.version;

cli.on('require', function(name) {
  logger.info('Requiring external module: `%s`', name);
});

if (DEV_ENV) {
  require("babel/register");
}

cli.launch({
  cwd: argv.cwd,
  configPath: argv.Aureliafile,
  require: argv.require,
  init_cwd: process.env.INIT_CWD,
  isDevEnv : DEV_ENV
}, handleCommands);


function handleCommands(env) {
  var aurelia;

  if (process.cwd() !== env.cwd) {
    process.chdir(env.cwd);
    logger.info('Working directory changed to: `%s`', env.cwd);
  }

  if (!env.modulePath) {
    logger.log('warn', 'Local aurelia installation not found!');
    aurelia = require('../index');
  } else {
    aurelia = require(env.modulePath);
  }

  aurelia.init({
      env : env
    , argv: argv
  });

  if (env.configPath && env.modulePath) {
    require(env.configPath);
    logger.info('Using Aureliafile: %s', env.configPath);
  } else {
    logger.log('warn', 'Aureliafile not found');
  }
  aurelia.run(argv);
}
