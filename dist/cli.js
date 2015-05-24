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

var _libExecCommand = require('./lib/exec-command');

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
      env.cmdDir = this.cmdDir;
      env.isCommand = this.isCommand;

      if (process.cwd() !== env.cwd) {
        process.chdir(env.cwd);
        logger.log('Working directory changed to', env.cwd);
      }

      env.commander = (0, _libExecCommand.configure)(env.argv, env.cmdDir(), env);

      Object.defineProperty(env, 'cmd', {
        get: function get() {
          return !!env.commander._commands[env.args[0]];
        }
      });

      return env;
    }
  }, {
    key: 'validation',
    value: function validation(env) {

      if (!env.modulePath) {
        logger.err('Local aurelia-cli not found in: %s', env.modulePath);
        env.isValid = false;
      }

      if (!env.configPath) {
        logger.err('No Aureliafile found at %s', env.configPath);
        env.isValid = false;
      }

      if (env.isValid) {
        env.aurelia = require(env.modulePath);
        env.configFile = require(env.configPath);
        env.aureliaFile = env.configFile(env.aurelia);
        env.isAureliaFile = true;
      }

      return env;
    }
  }, {
    key: 'start',
    value: function start(env) {
      var self = this;

      return new Promise(function (resolve, reject) {

        env.done = self.done(resolve);
        env.issue = self.issue(reject);

        function ready() {
          env.commander.run();
          resolve(env);
        }

        require(self.startFile).start.bind(self)(env, ready);
      });
    }
  }, {
    key: 'isCommand',
    value: function isCommand() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var isCmd = false;
      for (var index in args) {
        if (this.commander._commands[args[index]]) isCmd = true;
      }return isCmd;
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
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
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