import * as logger from './lib/logger';
import {Config} from './lib/config';
import {configure} from './lib/exec-command';

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
    env.cmdDir      = this.cmdDir;
    env.isCommand   = this.isCommand;
    // Change the CWD if it does not match the PWD of the local configFile
    if (process.cwd() !== env.cwd) {
      process.chdir(env.cwd);
      logger.log('Working directory changed to', env.cwd);
    }

    env.commander = configure(env.argv, env.cmdDir(), env);

    Object.defineProperty(env, 'cmd', {
      get: function() {
        return !!env.commander._commands[env.args[0]];
      }
    });

    return env;
  }

  /**
      validation

      > Validate the environment

      @param {Object} env The original event object

      @aurelia      instance of the local installation
      @configFile   instance of the local configFile
      @aureliaFile  instance of the local configFile after instantiated
      @isAureliaFile  {Boolean}  if The aureliaFile has been run

      @return  env
   */
  validation(env) {

    if (!env.modulePath) {
      logger.err('Local aurelia-cli not found in: %s', env.modulePath);
      env.isValid = false;
    }

    if (!env.configPath) {
      logger.err('No Aureliafile found at %s', env.configPath);
      env.isValid = false;
    }

    if (env.isValid) {
      env.aurelia       = require(env.modulePath);
      env.configFile    = require(env.configPath);
      env.aureliaFile   = env.configFile(env.aurelia);
      env.isAureliaFile = true;
    }

    return env;
  }

  /**
      start
      > Run the start.js file

      @param {Object} env The original event object

      @return  env
   */
  start(env) {
    var self = this;

    return new Promise(function(resolve, reject){

      env.done  = self.done(resolve);
      env.issue = self.issue(reject);

      function ready(){
        env.commander.run();
        resolve(env);
      }

      require(self.startFile).start.bind(self)(env, ready);

    });
  }
  isCommand(...args) {
    var isCmd = false;
    for (let index in args)
      if (this.commander._commands[args[index]])
        isCmd = true;

    return isCmd;
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
