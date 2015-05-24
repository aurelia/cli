'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.configure = configure;
exports.command = command;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ask = require('../ask');

var _utils = require('./utils');

var _events = require('events');

var _path = require('path');

var path = _interopRequireWildcard(_path);

var repeat = require('lodash/string/repeat');
var Promise = require('bluebird');
var log = console.log.bind(console);

var program = undefined,
    argv = undefined;

var Option = (function () {
  function Option(flags, info, parser) {
    _classCallCheck(this, Option);

    parser = parser && (0, _utils.kindof)(parser).fn ? parser : _utils.noop;

    info = info && (0, _utils.kindof)(info).string ? info : 'No Information provided';

    flags = flags && (0, _utils.kindof)(flags).string ? flags : console.error('Command.option(): First argument, flags, must be defined!');

    this.parser = parser;
    this.flags = flags;
    this.info = info;
    this.name = this.flags.match(/\-\-([a-z]+)/)[1];
    this._isParsed = false;
  }

  _createClass(Option, [{
    key: 'value',
    get: function () {
      this._value = this._value || this.parser(argv[this.name]);
      return this._value;
    }
  }, {
    key: 'isRequired',
    get: function () {
      if (this._required) this.parseFlags();
      return this._required;
    }
  }, {
    key: 'isOptional',
    get: function () {
      if (this._optional) this.parseFlags();
      return this._optional;
    }
  }, {
    key: 'parseFlags',
    value: function parseFlags() {
      var short = this.flags.match(/^\-([a-z]+)/);
      var long = this.flags.match(/\-\-([a-z]+)/);
      short = short && short.length && short[1];
      long = long && long.length && long[1];
      this._name = argv[short] && short || argv[long] && long;

      this._required = /\</.test(this.flags);
      this._optional = /\[/.test(this.flags);
      return this;
    }
  }]);

  return Option;
})();

var Command = (function () {
  function Command(name, args) {
    _classCallCheck(this, Command);

    var self = this;
    this.name = name;
    this._argNames = args;
    this._args = argv._.slice(1);
    this._argv = { _: [] };
    this._execs = {};
    this.isPrompts = false;
    this._prompts = { load: [], lazy: [] };
    this.isExec = false;
    this.options = {};

    program.on('--help', (function () {
      this.runHelp(false);
    }).bind(this));
    program.on(this.name + '--help', (function () {
      this.runHelp(true);
    }).bind(this));

    program.on(this.name, function () {
      self.runAction().then(function (payload) {
        program.emit(self.name + '-stop', payload);
      });
    });

    return this;
  }

  _createClass(Command, [{
    key: 'nameValue',
    get: function () {
      if (!this._nameValue) {
        this._nameValue = this.name + ' ';
        for (var index in this._argNames) {
          this._nameValue += this._argNames + ' ';
        }
      }
      return this._nameValue;
    }
  }, {
    key: 'isCmd',
    get: function () {
      return this._alias ? this.alias === program.cmd : this.name === program.cmd;
    }
  }, {
    key: 'opts',
    get: function () {
      return this._opts;
    }
  }, {
    key: 'argv',
    get: function () {

      return this._isParsed ? this._argv : this.parseArgv();
    }
  }, {
    key: 'prompts',
    get: function () {
      return this._prompts.lazy;
    }
  }, {
    key: 'isHelp',
    get: function () {
      return this.isCmd && !!argv.help;
    }
  }, {
    key: 'parseArgv',
    value: function parseArgv() {

      this._argNames.forEach((function (arg) {
        var isRequired = /\</.test(arg);
        var isOptional = /\[/.test(arg);
        var parsedName = arg.match(/(\w+)/)[0];
        var value = this._args.shift();
        this._argv[parsedName] = value;
      }).bind(this));
      this._argv._ = this._args;
      this._isParsed = true;
      return this._argv;
    }
  }, {
    key: 'exec',
    value: function exec(execPath) {
      var self = this;
      var execFile = function execFile() {
        if (!self._execFile) {
          self._execFile = require(path.join(require.main.filename, '../../', 'dist', execPath));
        }
        return self._execFile;
      };
      self.execFile = execFile.bind(this);
      return this;
    }
  }, {
    key: 'alias',
    value: function alias(substr) {
      (0, _utils.kindof)(substr).string && (this._alias = substr.trim());
      return this;
    }
  }, {
    key: 'description',
    value: function description(substr) {
      if ((0, _utils.kindof)(substr).string) this._description = substr;

      return this;
    }
  }, {
    key: 'prompt',
    value: function prompt(question, onLoad) {
      var self = this;
      self.promptOnLoad = self.promptOnLoad || onLoad;
      if (typeof question === 'object') {
        this._prompts[onLoad ? 'load' : 'lazy'].push(question);
        this.isPrompts = true;
        this.isPrompt = true;
        this.runPrompt = this._load_promp.bind(this);
        return this;
      }

      if (typeof question === 'function') {
        this.isPrompt = true;
        this.runPrompt = function () {
          return question.bind(self)(_ask.ask);
        };
        return this;
      }

      if (typeof question === 'string') {
        this.isPrompt = true;
        this.runPrompt = function () {
          return self.execFile()[question].bind(self)(_ask.ask);
        };
        return this;
      }
    }
  }, {
    key: 'help',
    value: function help(param) {
      var self = this;
      if (typeof param === 'function') {
        this.runHelp = param.bind(this);
        return this;
      }

      if (typeof param === 'string') {
        this.runHelp = function () {
          return self.execFile()[param].bind(this)();
        };
        return this;
      }
    }
  }, {
    key: 'option',
    value: function option(name, info, parser) {
      var self = this;

      var opt = new Option(name, info, parser);
      this.options[opt.name] = opt;
      program.when(opt.name).then(function () {
        self._isOpts = true;
        self._opts[opt.name] = opt.value;
      });
      return this;
    }
  }, {
    key: '_load_promp',
    value: function _load_promp() {
      return this._prompts.load.length ? (0, _ask.ask)(this._prompts.load) : Promise.resolve(this._prompts.lazy);
    }
  }, {
    key: 'action',
    value: function action(param) {
      var self = this,
          _action;

      this._action = function () {
        if (typeof param === 'function') {
          return param.bind(self)(self.argv, self._opts, self.answers);
        } else if (typeof param === 'string') {
          return self.execFile()[param].bind(self)(self.argv, self._opts, self.answers);
        } else {
          console.log('No Action Found');
          return Promise.reject();
        }
      };
      self.runAction = function () {
        if (self.isPrompt) {
          return self.runPrompt().then(function (answers) {
            self.answers = answers;
            return self._action();
          });
        } else {
          return Promise.resolve(self._action());
        }
      };
      return new Promise(function (resolve, reject) {
        program.on(self.name + '-stop', function (payload) {
          resolve(payload);
        });
      });
    }
  }, {
    key: 'runHelp',
    value: function runHelp(isCmd) {
      if (isCmd) {
        log();
        log('(%s)(%s): %s', 'aurelia'.magenta, 'HELP'.green, this.name.green);
      }
      log();
      log('  @%s $ %s', 'Command '.green, this.nameValue);
      log('  @%s : %s', 'Info    '.green, this._description);
      program.maxLongLength = program.maxLongLength || 0;
      var isFlags = false;
      for (var key in this.options) {
        isFlags = true;
        var option = this.options[key];
        if (option.flags.length > program.maxLongLength) program.maxLongLength = option.flags.length;
      }

      if (isFlags) log('  @%s     ', 'Flags   '.green);

      for (var key in this.options) {
        var option = this.options[key];
        var logs = ['    %s (%s) %s'];
        var len = program.maxLongLength - option.flags.length;
        var isRequired = /</.test(option.flags);
        logs.push(option.flags.cyan + repeat(' ', len));
        logs.push(isRequired ? 'required'.red : 'optional'.green);
        logs.push(option.info);
        console.log.apply(console, logs);
      }
      console.log();
    }
  }]);

  return Command;
})();

var Program = (function (_EventEmitter) {
  function Program(_argv, cmdDir, env) {
    _classCallCheck(this, Program);

    _get(Object.getPrototypeOf(Program.prototype), 'constructor', this).call(this);

    argv = _argv;
    this.args = argv._;
    this.argv = argv;
    this._commands = {};
    this.cmdDir = path.join.bind(path, cmdDir);
    this.env = env;
  }

  _inherits(Program, _EventEmitter);

  _createClass(Program, [{
    key: 'register',
    value: function register(cmd) {
      this._commands[cmd.name] = cmd;
    }
  }, {
    key: 'run',
    value: function run() {
      this.cmd = this.args[0];

      if (!this._commands[this.cmd]) {
        log();
        log('(%s)(%s)', 'aurelia'.magenta, 'HELP'.green);
        this.emit('--help');
      } else if (this.cmd && argv.help) {

        this.emit(this.cmd + '--help');
      } else if (argv.help) {
        this.emit('--help');
      } else {

        this.emit(this.cmd);

        for (var index in this.argv) {
          if (index !== '_') this.emit(this.argv[index]);
        }
      }
    }
  }, {
    key: 'when',
    value: function when(evt) {
      var self = this;
      return new Promise(function (resolve) {
        self.on(evt, function (payload) {
          resolve(payload);
        });
      });
    }
  }]);

  return Program;
})(_events.EventEmitter);

function configure(argv, cmdDir) {
  if (!program) {
    program = new Program(argv, cmdDir);
    program.emit('start', program.cmd);
  }
  exports.program = program;
  return program;
}

function command(name) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var cmd = new Command(name, args);
  program.register(cmd);
  return cmd;
}