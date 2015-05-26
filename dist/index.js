'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _libProgram = require('./lib/program');

var _libConfigStore = require('./lib/config/store');

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
      this.program = new _libProgram.Program(config);
      this.store = new _libConfigStore.Store(config);
      this.config = config;
      this.config.store = this.store;

      this.register(_commandsBundle2['default']);
      this.register(_commandsInit2['default']);
      this.register(_commandsNew2['default']);
    }
  }, {
    key: 'register',
    value: function register(Construction) {
      var command = new Construction(this.config, this.logger);
      Construction.register(this.program.command.bind(this.program, command));
      this.commands[command.commandId] = command;
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
        var c = new Cmd(program, this.config, this.logger);
        c.commandConfig = commandConfig;
        this.commands[c.commandId()] = c;
        return;
      }
    }
  }, {
    key: 'run',
    value: function run(argv) {
      var commandId = argv._[0];
      if (this.commands[commandId]) {

        this.program.emit(commandId);

        if (argv.help) {
          this.program.emit('--help');
        } else {
          this.program.emit('action');
        }
      } else if (argv.help) {
        this.program.emit('--help');
      }
    }
  }]);

  return Aurelia;
})();

var inst = new Aurelia();

exports['default'] = inst;
module.exports = exports['default'];