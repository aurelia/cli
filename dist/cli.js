'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.create = create;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _libLogger = require('./lib/logger');

var logger = _interopRequireWildcard(_libLogger);

var _libConfig = require('./lib/config');

var program = require('./lib/program');
var Promise = require('bluebird');
var path = require('path');

var AureliaCLI = (function () {
  function AureliaCLI(argv) {
    _classCallCheck(this, AureliaCLI);

    this.argv = argv;
    this.args = argv._;
    this.root = path.join.bind(path, __dirname);
    this.base = path.join.bind(path, __dirname, '../');
    this.libDir = path.join.bind(path, __dirname, 'lib');
    this.cmdDir = path.join.bind(path, __dirname, 'commands');

    this.initFile = this.root('init');
    this.startFile = this.root('start');

    this.settings = {
      isLocal: false,
      isGlobal: false,
      isConfig: false,
      isLaunched: false,
      isAureliaFile: false,
      isLocalEOD: false,
      isGlobalEOD: false
    };
  }

  _createClass(AureliaCLI, [{
    key: 'config',
    get: function () {
      return this.env.store.config;
    },
    set: function (value) {
      this.env.store.config = value;
    }
  }, {
    key: 'store',
    get: function () {
      return this.env.store;
    }
  }, {
    key: 'cwd',
    get: function () {
      if (!this.env.CWD) {
        this.env.CWD = path.join.bind(path, this.env.cwd);
      }
      return this.env.CWD;
    }
  }, {
    key: 'isCmd',
    value: function isCmd(cmd) {
      return this.args[0] === cmd;
    }
  }, {
    key: 'done',
    value: function done(resolve) {
      var self = this;
      return function done(args) {
        return resolve(self.env);
      };
    }
  }, {
    key: 'issue',
    value: function issue(reject) {
      var self = this;
      return function issue(args) {
        return reject(self.env);
      };
    }
  }, {
    key: 'quit',
    value: function quit() {
      this.store.save();
      logger.ok('Done');
    }
  }, {
    key: 'abort',
    value: function abort(err) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var str = '[%s]' + args.shift();
      args.unshift('Abort'.red);
      logger.err.apply(logger, args);
      return Promise.reject(err);
    }
  }, {
    key: 'launch',
    value: function launch(ENV) {
      return new Promise(function (resolve, reject) {
        ENV.AureliaCLI.launch(ENV, function (env) {
          resolve(env);
        });
      });
    }
  }, {
    key: 'configure',
    value: function configure(env) {

      this.env = env;
      env.argv = this.argv;
      env.args = this.args;
      env.lyftOff = this;
      env.isLaunched = true;
      env.isLocal = !!env.modulePath;
      env.isGlobal = !env.isLocal;
      env.configName = env.configNameSearch[0];
      env.store = new _libConfig.Config(env);
      env.isCmd = this.isCmd;

      if (process.cwd() !== env.cwd) {
        process.chdir(env.cwd);
        logger.log('Working directory changed to', env.cwd);
      }

      return env;
    }
  }, {
    key: 'initialize',
    value: function initialize(env) {
      var self = this;
      return new Promise(function (resolve, reject) {

        env.done = self.done(resolve);
        env.issue = self.issue(reject);

        require(self.initFile).init.bind(self)(env);

        env['continue'] = !program.isCmd(env._exec);

        if (env['continue']) resolve(env);
      });
    }
  }, {
    key: 'validation',
    value: function validation(env) {

      if (!env['continue']) if (!env.modulePath) {

        program.parse(process.argv);
        logger.err('Local aurelia-cli not found in: %s', env.modulePath);
        env['continue'] = false;
        return env;
      }

      if (!env.configPath) {
        program.parse(process.argv);
        logger.err('No Aureliafile found at %s', env.configPath);
        env['continue'] = false;
        return env;
      }

      return env;
    }
  }, {
    key: 'start',
    value: function start(env) {
      var self = this;
      if (!env['continue']) return env;

      env.aurelia = env.isLocal ? require(env.modulePath) : require(this.base('index'));

      env.configFile = require(env.configPath);
      env.aureliaFile = env.configFile(env.aurelia);
      env.isAureliaFile = true;

      require(env.startFile).start.bind(self)(env);

      program.parse(process.argv);

      return env;
    }
  }, {
    key: 'isExec',
    value: function isExec(name) {
      return this.env._exec === name;
    }
  }, {
    key: 'execute',
    value: function execute(name) {
      var self = this;
      this.env._exec = name;
      return function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return require(self.cmdDir(name)).action.apply(this, args);
      };
    }
  }, {
    key: 'import',
    value: function _import(pathToModule) {
      return require(this.root(pathToModule));
    }
  }]);

  return AureliaCLI;
})();

function create(argv, cb) {
  process.AURELIA = new AureliaCLI(argv);
  return cb(process.AURELIA);
}