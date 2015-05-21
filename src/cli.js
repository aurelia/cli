import * as logger from './lib/logger';
import {Config} from './lib/config';

var program = require('commander');
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

    // EOD === out of date;
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
    return this.store.config;
  }
  set config(value) {
    this.store.config = value;
  }

  get cwd() {
    if (!this.CWD) {
      this.CWD = path.join.bind(path, this.env.cwd);
    }
    return this.CWD;
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
      Launch lyftOff CLI, and return a promise
   */
  launch(ENV) {
    return new Promise(function (resolve, reject) {
      ENV.AureliaCLI.launch(ENV, function(env) {
        resolve(env);
      });
    });
  }

  /**
   * configure
   *
   * > Apply configurations to the cli
   *
   * @env {Object} The original event object
   * @param   env
   * @return  env
   *
   * @env    {Object} original env from liftOff
   * @liftOff         The AureliaCLI/liftOff context
   * @isLaunched {Boolean} has thie cli been launched
   *
   * @settings
   *   @isLocal    Does a local  installation exist
   *   @isGlobal   Does a global installation exist
   *
   * @store config store for reading and writing to the aireliafile
   */
  configure(env){
    this.env        = env;
    this.liftoff    = this;
    this.isLaunched = true;

    this.settings.isLocal  = !!env.modulePath;
    this.settings.isGlobal = !this.settings.isLocal;

    this.env.configName = env.configNameSearch[0];

    this.store = new Config(env);

    // Change the CWD if it does not match the PWD of the local configFile
    if (process.cwd() !== env.cwd) {
      process.chdir(env.cwd);
      logger.log('Working directory changed to', env.cwd);
    }

    return env;
  }

  /**
   * initialize
   *
   * > Run the init.js file to initialize any commands that **DO NOT** require the configFile
   *
   * @env {Object} The original event object
   * @param   env
   * @return  env
   *
   * @continue true toggle continue
   */
  initialize(env) {

    require(this.initFile).init.call(this);

    this.continue = true;

    return env;
  }

  /**
   * validation
   *
   * > Validate the environment
   *
   * @isLocal  Check for local installation and toggle continue
   * @isGlobal Check for the configFile or toggle continue
   *
   * @env {Object} The original event object
   * @param   env
   * @return  env
   */
  validation(env) {

    if (!env.modulePath) {
      program.parse(process.argv);
      logger.err('Local aurelia-cli not found in: %s', env.modulePath);
      this.continue = false;
      return env;
    }
    if (!env.configPath) {
      program.parse(process.argv);
      logger.err('No Aureliafile found at %s', env.configPath);
      this.continue = false;
      return env;
    }

    return env;
  }

  /**
   * start
   *
   * > Run the start.js file to initialize any commands that **DO** require the configFile
   *
   * @continue   Return if continue has been set to true.
   *             Continue will be set to true if no errors were found
   *             and a command was not found in the `init.js`
   *
   * @env {Object} The original event object
   * @param   env
   * @return  env
   *
   * @aurelia      instance of the local installation
   * @configFile   instance of the local configFile
   * @aureliaFile  instance of the local configFile after instantiated
   *
   * @isAureliaFile  {Boolean}  if The aureliaFile has been run
   *
   * @continue     true toggle continue
   */
  start(env) {
    var self = this;
    if (!this.continue) return env;
    this.aurelia         = this.settings.isLocal
      ? require(env.modulePath)
      : require(this.base('index'));

    this.configFile      = require(env.configPath);
    this.aureliaFile     = this.configFile(this.aurelia);
    this.settings.isAureliaFile = true;

    require(self.startFile).start.call(this);

    program.parse(process.argv);

    return env;
  }

  /**
   * isExec
   * @param  {String}  name command name
   * @return {Boolean}      is the given command running
   */
  isExec(name) {
    return this._exec === name;
  }

  /**
   * execute
   *
   * @param  {String}   name  Name of command to execute
   * @return {Function}       Function to be called that will require the commandfile.
   */
  execute(name) {
    var self = this;
    this._exec = name;
    return function(...args) {
      return require(self.cmdDir(name)).action.apply(this, args);
    };
  }

  /**
   * import
   *
   * > [safe-import]
   *
   * @param  {Sting}     pathToModule Path name to import from __dirname
   * @return {Instance}  Instance of the required module
   */
  import(pathToModule) {
    return require(this.root(pathToModule));
  }
}

/**
 * create
 *
 * > Instantiate the AureliaCli and set process.AURELIA
 *
 * @param  {Object}   argv  Original argv Object from bin/aurelia.js
 * @param  {Function} cb    Callback function that runs the cli
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
