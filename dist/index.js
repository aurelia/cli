'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _commandsBundle = require('./commands/bundle');

var _commandsBundle2 = _interopRequireDefault(_commandsBundle);

var _commandsInit = require('./commands/init');

var _commandsInit2 = _interopRequireDefault(_commandsInit);

var _commandsNew = require('./commands/new');

var _commandsNew2 = _interopRequireDefault(_commandsNew);

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
      this.config = config;
      var bundle = new _commandsBundle2['default'](_commander2['default'], this.config, this.logger);
      var init = new _commandsInit2['default'](_commander2['default'], this.config, this.logger);
      var newCmd = new _commandsNew2['default'](_commander2['default'], this.config, this.logger);

      this.commands[bundle.commandId] = bundle;
      this.commands[init.commandId] = init;
      this.commands[newCmd.commandId] = newCmd;
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
        var c = new Cmd(_commander2['default'], this.config, this.logger);
        this.commands[c.commandId()] = c;
        return;
      }
    }
  }, {
    key: 'run',
    value: function run(argv) {
      _commander2['default'].parse(argv);
    }
  }]);

  return Aurelia;
})();

var inst = new Aurelia();

exports['default'] = inst;
module.exports = exports['default'];