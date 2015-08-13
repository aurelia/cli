'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var _logger = require('../logger');

var logger = _interopRequireWildcard(_logger);

var _defaults = require('./defaults');

var extend = require('lodash/object/extend');
var basename = require('path').basename;
var cli;

var Config = (function () {
  function Config(env) {
    _classCallCheck(this, Config);

    cli = process.AURELIA;
    this.configName = basename(cli.env.configName);
    this.template = __dirname + ('/template/' + cli.env.configName);
    this._onready = [];
    this.isReady = false;
  }

  _createClass(Config, [{
    key: 'configPath',

    // Return the correct path to the configFile
    get: function () {
      return cli.env.configPath;
    }
  }, {
    key: 'config',

    // Return the current store Object
    get: function () {
      return cli.settings.isAureliaFile ? cli.aurelia.configuration : _defaults.defaults;
    },

    // Extend the current config
    set: function (value) {
      this._config = extend(this._config, value);
      cli.aurelia.configuration = this._config;
    }
  }, {
    key: 'init',

    /**
     * init
     *
     * > Initialize the config store, creating a new AureliaFile if one does not exist
     *
     * @param  {Object} config Updates to the _config
     */
    value: function init(config) {
      if (cli.env.configPath) {
        this._config = extend(this.config, config);
        logger.ok('Finished checking config file at [%s]', cli.env.configPath.cyan);
      } else {

        this._config = (0, _defaults.defaults)();
        this._config = extend(this._config, config);
        this.write(this._config);
      }
    }
  }, {
    key: 'write',

    /**
     * write
     *
     * > Write to the current configFile
     *
     * @param  {Object}   data  Updates to the _config
     * @param  {Function}  cb   callback function when complete
     * @return {Stream}         Return the vynl stream
     */
    value: function write(data, cb) {

      var self = this,
          vynl = require('vinyl-fs'),
          compile = require('gulp-template'),
          beautify = require('gulp-beautify');

      for (var key in data) {
        data[key] = JSON.stringify(data[key]);
      }
      vynl.src(this.template).pipe(compile(data)).pipe(beautify({ indentSize: 2 })).pipe(vynl.dest(cli.cwd())).on('finish', function () {
        self._config = data;
        self.save();
        logger.ok('Finished creating config file at [%s]', cli.cwd().cyan);
      }).on('error', function () {
        logger.err('Issue creating config file at [%s]', cli.cwd().red);
      });
    }
  }, {
    key: 'set',

    /**
     * set
     *
     * > Set properties on config to be saved.
     *
     * @param {String}   key   String || Object of new properties to add or Update config with
     * @param {value}   value  Object or value to apply to the key
     * @param {Function} cb    Callback to call when complete
     */
    value: function set(key, value, cb) {

      return this.ready(function () {

        if (typeof key === 'object') {
          value = key;
          key = null;
        }

        key ? this._config[key] = value : this._config = value;

        if (cb && typeof cb === 'function') {
          cb(this.config);
        }
      });
    }
  }, {
    key: 'save',

    /**
     * save
     * @param  {Object}   data Data to extend _config with
     * @param  {Function} cb   Callback to invoke when complete
     */
    value: function save(data, cb) {
      return this.ready(function () {
        if (data) {
          this.config = data;
        }
        this.write(this.config);
      });
    }
  }, {
    key: 'ready',
    value: function ready(cb) {
      if (this.isReady) {
        return cb.call(this);
      }
      this._onready.push(cb);
    }
  }, {
    key: 'onReady',
    value: function onReady() {
      this.isReady = true;
      this._onready.forEach(function (cb) {
        cb.call(this);
      });
    }
  }]);

  return Config;
})();

exports.Config = Config;