#!/usr/bin/env node --harmony

var // Dependencies
    argv     = require('minimist')(process.argv.slice(2))
  , variants = require('interpret').jsVariants
  // ^ automatically attempt to require module for any javascript variant
  , CLI     = require('../dist/cli')
  , Liftoff = require('liftoff')
;

var // Variables
  aureliaCli = new Liftoff({
      name       : 'aurelia-cli'
    , configName : 'Aureliafile'
    , extensions : variants
    , v8flags    : ['--harmony'] // to support all flags: require('v8flags') && respawn node with any flag listed here
  }),

  ENV = {
      cwd: argv.cwd
    , argv: argv
    , configName: 'Aureliafile'
    , AureliaCLI: aureliaCli
    , configPath: argv.aureliafile
    , require: argv.require
    , completion: argv.completion
    , verbose: argv.verbose
  }
;


CLI.create(argv,

  function(aurelia) {

    aurelia.launch(ENV)
           .bind(aurelia)

      .then(aurelia.configure)

      .then(aurelia.initialize)

      .then(aurelia.validation)

      .then(aurelia.start)

      .then(aurelia.stop);

      // .catch(aurelia.abort);
  }
);

