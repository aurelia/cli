var events = require('events');
var extend = require('lodash/object/extend');
var exists = require('fs').existsSync;
var program   = require('commander');
var chalk     = require('chalk');
var path      = require('path');
var Promise   = require('bluebird');

var rootDir     = path.join.bind(path, __dirname);
var cliDir      = rootDir.bind(rootDir, 'dist');

var pjson       = require(rootDir('package.json'));
var logger      = require(cliDir('lib/logger'));
var findConfig  = require(cliDir('lib/config/findConfig'));
var EventEmitter = events.EventEmitter;

process.AURELIA = {};
process.env.AURELIA = {};


var _Env = function(options) {
  this.name       = options.name;
  this.v8Flags    = options.v8flags;
  this.argv       = options.argv;
  this.cwd        = options.cwd;
  this.configName = options.configName;
  this.moduleName = options.name;
  this.modulePath = options.cwd + '/node_modules/' + this.name;
  this.configPath = options.cwd + '/' + this.configName + '.js';
  this.isConfig   = false;
  this.isModule   = false;
};
_Env.prototype = {
  get ENV() {
    return process.env;
  },
  get args(){
    return this.argv._;
  }
};

var AureliaCLI = function(options) {
  var self = this;
  this.env          = new _Env(options);
  this.v8Flags      = options.v8flags;
  this.extensions   = options.extensions;
  this.pkg          = pjson;
  this.name         = options.name;
  this.processTitle = this.pkg.name;
  this.mainPath     = rootDir('Aureliafile.js');

  this.isLaunched     = false;
  this.isAureliaFile  = false;
  process.AURELIA     = this;


  findConfig(options)
    .bind(this)
    .then(function(opts){
      this.env.isConfig = opts.isConfig;
      if (opts.isConfig) {
        this.env.configPath = opts.configPath;
        this.env.configBase = opts.configBase;
        if (process.cwd() !== this.env.configBase) {
          process.chdir(this.env.configBase);
          this.env.cwd = this.env.configBase;
          console.log('Working directory changed to', this.env.cwd);
        }
      }
    });
};


AureliaCLI.prototype = {
  root: cliDir,
  get config(){
    return this._config;
  },
  set aurelia(val) {
    this._instance = val;
    process.env.AURELIA.instance = val;
  },
  get aurelia() {
    return process.env.AURELIA.instance || this._instance;
  },
  logger: logger,
  emit: program.emit
};

AureliaCLI.prototype.on = function(evt) {
  var self = this;
  return new Promise(function(resolve, reject){
    program.on(evt, function(e){
      resolve.bind(self)(e);
    });
  });
};

AureliaCLI.prototype.launch = function() {

  // Change the CWD if it does not match the PWD of the local configFile
  if (process.cwd() !== this.env.cwd) {
    process.chdir(this.env.cwd);
    console.log('Working directory changed to', this.env.cwd);
  }

  // set launched to true.
  this.isLaunched = true;

  // set isModule to true if a local module exists.
  this.env.isModule = exists(this.env.modulePath);
  // set isConfig to true if a local module exists.
  this.env.isConfig = exists(this.env.configPath);

  // add the store to context
  this.store    = require(cliDir('lib/config'));

  // Emit the init event;
  this.onInitialize(program);

  // condition when no local module is found
  if (!this.env.isModule) {
    console.log('Local aurelia-cli not found in:', this.env.modulePath);
  }

  // Condition when no local Aureliafile is found
  if (!this.env.isConfig) {
    console.log('No Aureliafile found.');
    program.parse(process.argv);
    return;
  }

  // set the aurlia instance
  this.aurelia         = require(this.mainPath);

  // set the local Aureliafile on the environment
  this.env.configFile  = require(this.env.configPath);

  // invoke the local Aureliafile
  this.aureliaFile     = this.env.configFile(this.aurelia);

  this.isAureliaFile = true;

  this.onReady(program);

  program.parse(process.argv);
};

AureliaCLI.prototype.initialize = function(cb) {
  this.onInitialize = cb.bind(this);
};
AureliaCLI.prototype.ready = function(cb) {
  this.onReady = cb.bind(this);
};

AureliaCLI.prototype.import = function(dir) {
  return require(this.root(dir));
};

AureliaCLI.prototype.exec = require(cliDir('commands'));

module.exports = AureliaCLI;
