var events = require('events');
var extend = require('lodash/object/extend');
var exists = require('fs').existsSync;
var program   = require('commander');
var chalk     = require('chalk');
var path      = require('path');

var rootDir   = path.join.bind(path, __dirname);
var bundler   = require(rootDir('lib/bundler'));
var pjson     = require(rootDir('package.json'));
var installer = require(rootDir('lib/installer'));
var logger    = require(rootDir('lib/logger'));



var EventEmitter = events.EventEmitter

process.AURELIA = {};
process.env.AURELIA = {};


var _Env = function(options) {
  this.name           = options.name;
  this.argv       = options.argv;
  this.cwd        = options.cwd;
  this.configName = options.configName;
  this.modulePath = this.argv.cwd + '/node_modules/' + this.name;

  this.isConfig   = false;
}
_Env.prototype = {
  get configFile() {
    return process.cwd() + '/' + this.configName;
  },
  get ENV() {
    return process.env
  },
  get args(){
    return this.argv._;
  }
};

var AureliaCLI = function(options) {

  EventEmitter.call(this);

  this.env          = new _Env(options);
  this.v8Flags      = options.v8flags;
  this.extensions   = options.extensions;
  this.name         = options.name;
  this.pkg          = pjson;
  this.moduleName   = this.pkg.name;
  this.processTitle = this.pkg.name;
  this.mainPath     = rootDir('index.js')

  this.launchFile     = options.launchFile;
  this.isModule       = false;
  this.isLaunched     = false;
  process.AURELIA     = this;
};

AureliaCLI.prototype = Object.create(EventEmitter.prototype);

extend(AureliaCLI.prototype, {
  root: rootDir,
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
  on: program.on,
  emit: program.emit
});


AureliaCLI.prototype.launch = function() {

  var launched = require(rootDir(this.launchFile));
  var API      = require(rootDir('api'));
  this.api = new API();

  // Change the CWD if it does not match the PWD of the local configFile
  // if (process.cwd() !== this.env.cwd) {
  //   process.chdir(process.env.);
  //   console.log('Working directory changed to', this.env.cwd);
  // }

  this.isLaunched = true;

  if (exists(this.env.modulePath)) {
    this.isModule = true;
  }

  if (exists(this.env.configPath)) {
    this.env.isConfig = true;
    this.env.configFile   = require(this.env.configPath);
  }

  this.store    = require(rootDir('lib/config'));

  launched.init.bind(this)(this.env.argv, program);

  if (!this.isModule) {
    console.log('Global aurelia-cli not found in:', this.env.cwd);
    program.parse(process.argv);
    return;
  }

  if (!this.isConfig) {
    console.log('No Aureliafile found.');
    program.parse(process.argv);
    return;
  }

  this.aurelia = require(this.mainPath);
  this.aureliaInst = aurelia = require(env.modulePath);
  this.aureliaFile = require(env.configPath)(aurelia);
  if (!this.store.isReady) {
    this.store.init();
  }


  launched.ready.bind(this)(this.env.argv, program);
  program.parse(process.argv);
}

AureliaCLI.prototype.import = function(dir) {
  return require(this.root(dir));
}



module.exports = AureliaCLI;
