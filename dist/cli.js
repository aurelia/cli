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

var program = require('commander');
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
      return this.store.config;
    },
    set: function (value) {
      this.store.config = value;
    }
  }, {
    key: 'cwd',
    get: function () {
      if (!this.CWD) {
        this.CWD = path.join.bind(path, this.env.cwd);
      }
      return this.CWD;
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
      this.liftoff = this;
      this.isLaunched = true;

      this.settings.isLocal = !!env.modulePath;
      this.settings.isGlobal = !this.settings.isLocal;

      this.env.configName = env.configNameSearch[0];

      this.store = new _libConfig.Config(env);

      if (process.cwd() !== env.cwd) {
        process.chdir(env.cwd);
        logger.log('Working directory changed to', env.cwd);
      }

      return env;
    }
  }, {
    key: 'initialize',
    value: function initialize(env) {

      require(this.initFile).init.call(this);

      this['continue'] = true;

      return env;
    }
  }, {
    key: 'validation',
    value: function validation(env) {

      if (!env.modulePath) {
        program.parse(process.argv);
        logger.err('Local aurelia-cli not found in: %s', env.modulePath);
        this['continue'] = false;
        return env;
      }
      if (!env.configPath) {
        program.parse(process.argv);
        logger.err('No Aureliafile found at %s', env.configPath);
        this['continue'] = false;
        return env;
      }

      return env;
    }
  }, {
    key: 'start',
    value: function start(env) {
      var self = this;
      if (!this['continue']) return env;
      this.aurelia = this.settings.isLocal ? require(env.modulePath) : require(this.base('index'));

      this.configFile = require(env.configPath);
      this.aureliaFile = this.configFile(this.aurelia);
      this.settings.isAureliaFile = true;

      require(self.startFile).start.call(this);

      program.parse(process.argv);

      return env;
    }
  }, {
    key: 'isExec',
    value: function isExec(name) {
      return this._exec === name;
    }
  }, {
    key: 'execute',
    value: function execute(name) {
      var self = this;
      this._exec = name;
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