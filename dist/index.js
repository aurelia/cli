'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var Aurelia = (function () {
  function Aurelia() {
    _classCallCheck(this, Aurelia);

    this.commands = {};
    this.name = 'Aurelia CLI tool';
    this.config = {};
    this.logger = _winston2['default'];
  }

  _createClass(Aurelia, [{
    key: 'init',
    value: function init(config) {
      var _this = this;

      this.config = config;

      _commander2['default'].version(require('../package.json').version);
      _commander2['default'].on('*', function (cmd) {
        _this.logger.warn('Unknown command: \'' + cmd + '\'');
        _commander2['default'].outputHelp();
      });

      var cmdDir = __dirname + _path2['default'].sep + 'commands';
      _fs2['default'].readdirSync(cmdDir).forEach(function (f) {
        _this._register(require(cmdDir + _path2['default'].sep + f));
      });
    }
  }, {
    key: '_register',
    value: function _register(Command, cmdConfig) {

      var commandName = Command.command;
      var fullCommand = commandName;
      var cmd = new Command(this.config, this.logger);

      var subcommand = Command.args || '';

      if (subcommand !== '') {
        fullCommand = '' + commandName + ' ' + subcommand;
      }

      var c = _commander2['default'].command(fullCommand);

      if (Command.alias) {
        c.alias(Command.alias);
      }

      if (Command.options) {
        Command.options.forEach(function (o) {
          if (o.fn) {
            c.option(o.opt, o.desc, o.fn, o.defaultValue);
          } else {
            c.option(o.opt, o.desc);
          }
        });
      }

      if (Command.description) {
        c.description(Command.description);
      }

      c.action(cmd.action.bind(cmd));

      cmd.commandConfig = cmdConfig;
      this.commands[commandName] = cmd;
    }
  }, {
    key: 'command',
    value: function command() {
      if (typeof arguments[0] === 'string') {
        var commandId = arguments[0];
        var config = arguments[1];
        this.commands[commandId].commandConfig = config;
        return;
      }

      if (typeof arguments[0] === 'function') {
        var Cmd = arguments[0];
        var commandConfig = arguments[1];
        this._register(Cmd, commandConfig);
        return;
      }
    }
  }, {
    key: 'run',
    value: function run(argv) {
      _commander2['default'].parse(argv);
      if (_commander2['default'].args.length < 1) {
        _commander2['default'].outputHelp();
      }
    }
  }]);

  return Aurelia;
})();

var inst = new Aurelia();

exports['default'] = inst;
module.exports = exports['default'];