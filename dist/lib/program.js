'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashObjectExtend = require('lodash/object/extend');

var _lodashObjectExtend2 = _interopRequireDefault(_lodashObjectExtend);

var _lodashStringRepeat = require('lodash/string/repeat');

var _lodashStringRepeat2 = _interopRequireDefault(_lodashStringRepeat);

var _ask = require('./ask');

var argv = undefined,
    env = undefined,
    program = undefined;

var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;

var Command = (function () {
  function Command(Construction, commandId) {
    _classCallCheck(this, Command);

    var self = this;
    this.context = this.createContext(Construction, commandId);
    this._readyCallbacks = [];
    this._prompts = this.context.prompts || [];
    program.on(commandId, function () {

      self._readyCallbacks.forEach(function (fn) {
        fn();
      });
      program.on('action', function () {
        self._runAction();
      });

      program.on('--help', function () {
        self.context.help();
      });
    });
    return this;
  }

  _createClass(Command, [{
    key: 'createContext',
    value: function createContext(Construction, commandId) {

      for (var proto in Construction.prototype) {
        if (/^(on)/.test(proto)) {
          var eventName = proto.slice(2);
          eventName = eventName[0].toLowerCase() + eventName.slice(1);
          this._onEvent(proto, eventName);
        }
      }
      Construction.commandId = commandId;
      Construction.argv = { _: [] };
      Construction._args = argv._.slice(1);
      Construction.options = {};
      Construction.help = Construction.help || this._help.bind(Construction, console.log, Construction.argv, Construction.options);
      Construction.prompts = Construction.prompts || {};
      return Construction;
    }
  }, {
    key: '_ready',
    value: function _ready(fn) {
      this._readyCallbacks.push(fn.bind(this));
    }
  }, {
    key: '_onEvent',
    value: function _onEvent(proto, evt) {
      program.on(evt, (function (payload) {
        this.context[proto].bind(this.context)(payload);
      }).bind(this));
    }
  }, {
    key: '_option',
    value: function _option(flags, info, parseFn, name, alias) {
      var value = argv[name] || argv[alias];
      var isRequired = /</.test(flags);
      var isOptional = /\[/.test(flags);
      var getValue,
          prototypeName = parseFn;
      parseFn = function () {
        return value;
      };

      getValue = function (protoName) {
        return function () {
          return protoName ? this.context[protoName](value) : value;
        };
      };

      if (this.isPrototype(prototypeName)) {
        parseFn = getValue(prototypeName);
      } else {
        prototypeName = 'on' + name[0].toUpperCase() + name.slice(1);
        if (this.isPrototype(prototypeName)) {
          parseFn = getValue(prototypeName);
        }
      }

      this.context.options[name] = Object.defineProperties({
        name: name,
        alias: alias,
        info: info,
        flags: flags,
        required: isRequired,
        optional: isOptional
      }, {
        value: {
          get: function () {
            return parseFn();
          },
          configurable: true,
          enumerable: true
        }
      });

      if (value) this.context.argv[name] = this.options[name].value;

      return this;
    }
  }, {
    key: 'option',
    value: function option(flags, info, parseFn) {
      var self = this;
      if (flags.length > program.maxFlags) {
        program.maxFlags = flags.length;
      }
      var name = flags.match(/\-\-(\w+)/)[1];
      var alias = flags.match(/^\-(\w+)/)[1];

      this._ready(function () {
        if (argv[name] || argv[alias] || argv.help) {
          self._option(flags, info, parseFn, name, alias);
        }
      });
      return this;
    }
  }, {
    key: 'arg',
    value: function arg(str) {
      var name = str.match(/(\w+)/)[0];
      var isRequired = /</.test(str);
      var isOptional = /\[/.test(str);
      var value = this.context._args.shift();

      if (value) {
        this.context.argv[name] = value;
        this.context.argv._.push(value);
      }
      return this;
    }
  }, {
    key: 'alias',
    value: function alias(str) {
      this.context.alias = str;
      if (argv._[0] === str && arg._[0] !== this.context.commandId) {
        argv._[0] = this.context.commandId;
      }
      return this;
    }
  }, {
    key: 'description',
    value: function description(text) {
      this.context.description = text;
      return this;
    }
  }, {
    key: '_runPrompt',
    value: function _runPrompt() {

      var self = this;
      if (this.context.prompt) {
        return this.context.prompt(_ask.ask, this.argv, self.options, self._prompts);
      }
      if (this._prompts.length) {
        return (0, _ask.ask)(self._prompts);
      }
    }
  }, {
    key: 'prompt',
    value: function prompt(stringFN) {
      var self = this;
      if (typeof stringFN === 'string' && this.isPrototype(stringFN)) {
        this.context.prompt = this.context[stringFN];
      } else if (typeof stringFN === 'function') {
        this.context.prompt = stringFN.bind(this.context);
      } else if (Array.isArray(stringFN)) {
        this._prompts = stringFN;
      } else if (typeof stringFN === 'object') {
        this._prompts.push(stringFN);
      }
      return this;
    }
  }, {
    key: 'beforeAction',
    value: function beforeAction(stringFN) {
      if (typeof stringFN === 'string') {
        if (stringFN === 'prompt') {
          this._beforeAction = this._runPrompt;
        } else if (this.isPrototype(stringFN)) {
          this._beforeAction = this.context[str].bind(this.context);
        }
      } else if (typeof stringFN === 'function') {
        this._beforeAction = stringFN.bind(this);
      }
      return this;
    }
  }, {
    key: '_runAction',
    value: function _runAction() {
      var self = this;
      return Promise.resolve().then(function () {
        if (self._beforeAction) return self._beforeAction(self.context.argv, self.context.options);

        if (self.context.beforAction && typeof self.context.beforAction === 'function') return self.context.beforAction(self.context.argv, self.context.options);

        return;
      }).then(function (before) {
        return self.context.action(self.context.argv, self.context.options, before);
      }).then(function (action) {
        if (self.context.afterAction && typeof self.context.afterAction) return self.context.afterAction(self.context.argv, self.context.options, action);
        return;
      });
    }
  }, {
    key: 'action',
    value: function action(stringFN) {
      if (typeof stringFN === 'string' && this.isPrototype(stringFN)) {
        this.context.action = this.context[stringFN];
      } else if (typeof stringFN === 'function') {
        this.context.action = stringFN.bind(this.context);
      } else {
        this.context.action = this.context.action || (function () {
          return console.log('No Action found for command %s', this.name);
        }).bind(this);
      }
      return this;
    }
  }, {
    key: 'help',
    value: function help(stringFN) {
      if (typeof stringFN === 'string' && this.isPrototype(stringFN)) {
        this.context.help = this.context[stringFN];
      } else if (typeof stringFN === 'function') {
        this.context.help = stringFN.bind(this.context);
      } else {
        this.context.help = this.context.help || this._help.bind(this.context, console.log);
      }
      return this;
    }
  }, {
    key: '_help',
    value: function _help(log, argv, options) {
      log();
      log('@%s %s', 'command'.green, this.commandId);
      log('@%s %s', 'info   '.green, this.description);
      var isFlags;
      for (var index in options) {
        if (!isFlags) log('@%s', 'flags  '.green);

        isFlags = true;
        var option = options[index];
        var padding = (0, _lodashStringRepeat2['default'])(' ', program.maxFlags - option.flags.length);

        log('   ' + option.flags.cyan + padding, option.required ? 'required'.red : 'optional'.green, option.info);
      }
      log();
    }
  }, {
    key: 'isPrototype',
    value: function isPrototype(name) {
      return typeof name === 'string' && typeof this.context[name] === 'function';
    }
  }]);

  return Command;
})();

exports.Command = Command;

var Program = (function (_EventEmitter) {
  function Program(config) {
    _classCallCheck(this, Program);

    _get(Object.getPrototypeOf(Program.prototype), 'constructor', this).call(this);
    program = this;
    argv = config.argv;
    this.maxFlags = 0;
  }

  _inherits(Program, _EventEmitter);

  _createClass(Program, [{
    key: 'command',
    value: function command(cmd, cmdId) {
      var commandId = commandId;
      var command = new Command(cmd, cmdId);
      return command;
    }
  }]);

  return Program;
})(EventEmitter);

exports.Program = Program;