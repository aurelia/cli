import * as logger from './lib/logger';
import {Config} from './lib/config';

var program = require('./lib/program');
var Promise = require('bluebird');
var path = require('path');

class AureliaCLI{

  constructor(argv) {
    this.argv = argv;
    this.args = argv._;
    this.root    = path.join.bind(path, __dirname);
    this.base    = path.join.bind(path, __dirname, '../');
    this.libDir  = path.join.bind(path, __dirname, 'lib');
    this.cmdDir  = path.join.bind(path, __dirname, 'commands');

    this.initFile   = this.root('init');
    this.startFile  = this.root('start');

    this.settings = {
        isLocal       : false
      , isGlobal      : false
      , isConfig      : false
      , isLaunched    : false
      , isAureliaFile : false
      , isLocalEOD    : false
      , isGlobalEOD   : false
    };
  }

  get config() {
    return this.env.store.config;
  }
  set config(value) {
    this.env.store.config = value;
  }

  get store() {
    return this.env.store;
  }

  get cwd() {
    if (!this.env.CWD) {
      this.env.CWD = path.join.bind(path, this.env.cwd);
    }
    return this.env.CWD;
  }

  isCmd(cmd){
    return this.args[0] === cmd;
  }

  done(resolve) {
    var self = this;
    return function done(args) {
      return resolve(self.env);
    };
  }

  issue(reject) {
    var self = this;
    return function issue(args) {
      return reject(self.env);
    };
  }


  quit() {
    this.store.save();
    logger.ok('Done');
  }

  abort(err, ...args) {
    var str = '[%s]' + args.shift();
    args.unshift('Abort'.red);
    logger.err.apply(logger, args);
    return Promise.reject(err);
  }

  /*
      Launch lyftOff CLI
      @ENV   Environment passed from bin/aurelia

      return a promise
   */
  launch(ENV) {
    return new Promise(function (resolve, reject) {
      ENV.AureliaCLI.launch(ENV, function(env) {
        resolve(env);
      });
    });
  }

  /**
      configure

      > Apply configurations to the cli

      @env {Object} The original ENV

      @liftOff    {Object}  The AureliaCLI/liftOff context
      @isLaunched {Boolean} has thie cli been launched

      @settings
        @isLocal  {Boolean} Does a local  installation exist
        @isGlobal {Boolean} Does a global installation exist

      @store {Object} config store for reading and writing to the Aureliafile

      return original ENV
   */
  configure(env){

    this.env = env;
    env.argv        = this.argv;
    env.args        = this.args;
    env.lyftOff     = this;
    env.isLaunched  = true;
    env.isLocal     = !!env.modulePath;
    env.isGlobal    = !env.isLocal;
    env.configName  = env.configNameSearch[0];
    env.store       = new Config(env);
    env.isCmd       = this.isCmd;
    // Change the CWD if it does not match the PWD of the local configFile
    if (process.cwd() !== env.cwd) {
      process.chdir(env.cwd);
      logger.log('Working directory changed to', env.cwd);
    }

    return env;
  }

  /**
      initialize

      > Run the init.js file to initialize any commands that **DO NOT** require the configFile

      @env {Object} The original event object
      @param   env
      @return  env

      @continue true toggle continue
   */
  initialize(env) {
    var self = this;
    return new Promise(function(resolve, reject){

      env.done  = self.done(resolve);
      env.issue = self.issue(reject);

      require(self.initFile).init.bind(self)(env);

      env.continue = !program.isCmd(env._exec);

      if (env.continue)
        resolve(env);
    });
  }

  /**
      validation

      > Validate the environment

      @isLocal  Check for local installation and toggle continue
      @isGlobal Check for the configFile or toggle continue

      @env {Object} The original event object
      @param   env
      @return  env
   */
  validation(env) {

    if (!env.continue)
      if (!env.modulePath) {

        program.parse(process.argv);
        logger.err('Local aurelia-cli not found in: %s', env.modulePath);
        env.continue = false;
        return env;
      }


      if (!env.configPath) {
        program.parse(process.argv);
        logger.err('No Aureliafile found at %s', env.configPath);
        env.continue = false;
        return env;
      }

    return env;
  }

  /**
      start

      > Run the start.js file to initialize any commands that **DO** require the configFile

      @continue   Return if continue has been set to true.
                  Continue will be set to true if no errors were found
                  and a command was not found in the `init.js`

      @env {Object} The original event object
      @param   env
      @return  env

      @aurelia      instance of the local installation
      @configFile   instance of the local configFile
      @aureliaFile  instance of the local configFile after instantiated

      @isAureliaFile  {Boolean}  if The aureliaFile has been run

      @continue     true toggle continue
   */
  start(env) {
    var self = this;
    if (!env.continue) return env;

    env.aurelia = env.isLocal
      ? require(env.modulePath)
      : require(this.base('index'));

    env.configFile       = require(env.configPath);
    env.aureliaFile      = env.configFile(env.aurelia);
    env.isAureliaFile    = true;

    require(env.startFile).start.bind(self)(env);

    program.parse(process.argv);

    return env;
  }

  /**
      isExec
      @param  {String}  name command name
      @return {Boolean}      is the given command running
   */
  isExec(name) {
    return this.env._exec === name;
  }

  /**
      execute

      @param  {String}   name  Name of command to execute
      @return {Function}       Function to be called that will require the commandfile.
   */
  execute(name) {
    var self = this;
    this.env._exec = name;
    return function(...args) {
      return require(self.cmdDir(name)).action.apply(this, args);
    };
  }

  /**
      import

      > [safe-import]

      @param  {Sting}     pathToModule Path name to import from __dirname
      @return {Instance}  Instance of the required module
   */
  import(pathToModule) {
    return require(this.root(pathToModule));
  }
}

  /**
      create

      > Instantiate the AureliaCli and set process.AURELIA

      @param  {Object}   argv  Original argv Object from bin/aurelia.js
      @param  {Function} cb    Callback function that runs the cli
   */
export function create(argv, cb) {
  process.AURELIA = new AureliaCLI(argv);
  return cb(process.AURELIA);
}

// program.Command.prototype._command = program.Command.prototype.command;

// program.Command.prototype.command = function(name, desc, opts) {
//   var self = this;
//   return new Promise(function(resolve, reject){
//     return resolve(self._command(name, desc, opts))
//   });
// };
