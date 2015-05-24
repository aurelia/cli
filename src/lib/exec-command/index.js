import {ask}  from '../ask';
import {noop, kindof, parseArg} from './utils';
import {EventEmitter} from 'events';
import * as path from 'path';
var repeat = require('lodash/string/repeat');
let Promise = require('bluebird');
let log = console.log.bind(console);

let program, argv;

class Option {

  constructor(flags, info, parser){

    parser = (parser && kindof(parser).fn) ? parser : noop;

    info   = (info   && kindof(info).string) ? info   : 'No Information provided';

    flags  = (flags   && kindof(flags).string) ? flags   : console.error('Command.option(): First argument, flags, must be defined!');

    this.parser = parser;
    this.flags  = flags;
    this.info   = info;
    this.name = this.flags.match(/\-\-([a-z]+)/)[1];
    this._isParsed = false;
  }


  get value() {
    this._value = this._value || this.parser(  argv[this.name]  );
    return this._value;
  }

  get isRequired() {
    if (this._required) this.parseFlags();
    return this._required;
  }

  get isOptional() {
    if (this._optional) this.parseFlags();
    return this._optional;
  }

  parseFlags() {
    let short = this.flags.match(/^\-([a-z]+)/);
    let long  = this.flags.match(/\-\-([a-z]+)/);
    short = short && short.length && short[1];
    long  = long  && long.length && long[1];
    this._name = (  argv[short] && short  ) || (  argv[long] && long  );

    this._required = /\</.test(this.flags);
    this._optional = /\[/.test(this.flags);
    return this;
  }
}

class Command{
  constructor(name, args) {
    var self = this;
    this.name   = name;
    this._argNames = args;
    this._args  = argv._.slice(1);
    this._argv  = {_:[]};
    this._execs = {};
    this.isPrompts = false;
    this._prompts  = {load:[], lazy:[]};
    this.isExec    = false;
    this.options   = {};

    program.on('--help', function() {
      this.runHelp(false);
    }.bind(this));
    program.on(this.name + '--help', function() {
      this.runHelp(true);
    }.bind(this));

    program.on(this.name, function(){
      self.runAction().then(function(payload){
        program.emit(self.name+'-stop', payload);
      });
    });

    return this;
  }

  get nameValue() {
    if (!this._nameValue) {
      this._nameValue = this.name + ' ';
      for(let index in this._argNames) {
        this._nameValue += this._argNames + ' ';
      }
    }
    return this._nameValue;
  }

  get isCmd() {
    return this._alias ? (this.alias === program.cmd) : (this.name  === program.cmd);
  }

  get opts() {
    return this._opts;
  }

  get argv() {

    return this._isParsed ? this._argv : this.parseArgv();
  }

  get prompts() {
    return this._prompts.lazy;
  }

  get isHelp(){
    return this.isCmd && !!argv.help;
  }

  parseArgv() {

    this._argNames.forEach(function(arg){
      var isRequired = /\</.test(arg);
      var isOptional = /\[/.test(arg);
      var parsedName = arg.match(/(\w+)/)[0];
      var value = this._args.shift();
      this._argv[parsedName] = value;
    }.bind(this));
    this._argv._ = this._args;
    this._isParsed = true;
    return this._argv;
  }

  exec(execPath) {
    var self = this;
    var execFile = function() {
      if (!self._execFile) {
        self._execFile = require(path.join(require.main.filename, '../../', 'dist', execPath));
      }
      return self._execFile;
    };
    self.execFile = execFile.bind(this);
    return this;
  }

  alias(substr) {
    kindof(substr).string
      &&( this._alias = substr.trim() );
    return this;
  }

  description(substr) {
    if (kindof(substr).string )
      this._description = substr;

    return this;
  }

  prompt(question, onLoad) {
    var self = this;
    self.promptOnLoad = self.promptOnLoad || onLoad;
    if (typeof question === 'object') {
      this._prompts[onLoad ? 'load' : 'lazy'].push(question);
      this.isPrompts = true;
      this.isPrompt  = true;
      this.runPrompt = this._load_promp.bind(this);
      return this;
    }

    if (typeof question === 'function') {
      this.isPrompt  = true;
      this.runPrompt = function() {
        return question.bind(self)(ask);
      };
      return this;
    }

    if(typeof question === 'string') {
      this.isPrompt  = true;
      this.runPrompt = function() {
        return self.execFile()[question].bind(self)(ask);
      };
      return this;
    }
  }

  help(param) {
    var self = this;
    if (typeof param === 'function') {
      this.runHelp = param.bind(this);
      return this;
    }

    if (typeof param === 'string') {
      this.runHelp = function() {
        return self.execFile()[param].bind(this)();
      };
      return this;
    }
  }

  option(name, info, parser) {
    var self = this;

    var opt = new Option(name, info, parser);
    this.options[opt.name] = opt;
    program.when(opt.name)
      .then(function(){
        self._isOpts = true;
        self._opts[opt.name] = opt.value;
      });
    return this;
  }

  _load_promp() {
    return this._prompts.load.length
      ? ask(this._prompts.load)
      : Promise.resolve(this._prompts.lazy);
  }

  action(param) {
    var self = this, _action;

    this._action = function() {
      if (typeof param === 'function') {
        return param.bind(self)(self.argv, self._opts, self.answers);
      }
      else if(typeof param === 'string') {
        return self.execFile()[param].bind(self)(self.argv, self._opts, self.answers);
      }
      else {
        console.log('No Action Found');
        return Promise.reject();
      }
    };
    self.runAction = function(){
      if (self.isPrompt) {
          return self.runPrompt().then(function(answers){
            self.answers = answers;
            return self._action();
          });
      } else {
        return Promise.resolve(self._action());
      }
    };
    return new Promise(function(resolve, reject){
      program.on(self.name + '-stop', function(payload){
        resolve(payload);
      });
    });
  }

  runHelp(isCmd){
    if(isCmd) {
      log();
      log('(%s)(%s): %s', 'aurelia'.magenta, 'HELP'.green, this.name.green);
    }
    log();
    log('  @%s $ %s', 'Command '.green, this.nameValue);
    log('  @%s : %s', 'Info    '.green, this._description);
    program.maxLongLength = program.maxLongLength || 0;
    var isFlags = false;
    for (let key in this.options) {
      isFlags = true;
      let option = this.options[key];
      if (option.flags.length > program.maxLongLength)
        program.maxLongLength = option.flags.length;
    }

    if (isFlags)
      log('  @%s     ', 'Flags   '.green);

    for (let key in this.options) {
      let option = this.options[key];
      let logs   = ['    %s (%s) %s'];
      let len = program.maxLongLength - option.flags.length;
      let isRequired = /</.test(option.flags);
      logs.push(option.flags.cyan + repeat(' ', len));
      logs.push((isRequired ? 'required'.red : 'optional'.green));
      logs.push(option.info);
      console.log.apply(console, logs);
    }
    console.log();
  }
}

class Program extends EventEmitter{

  constructor(_argv, cmdDir, env) {

    super();

    argv = _argv;
    this.args = argv._;
    this.argv = argv;
    this._commands = {};
    this.cmdDir = path.join.bind(path, cmdDir);
    this.env = env;
  }

  register(cmd) {
    this._commands[cmd.name] = cmd;
  }

  run() {
    this.cmd = this.args[0];

    if (!this._commands[this.cmd]) {
      log();
      log('(%s)(%s)', 'aurelia'.magenta, 'HELP'.green);
      this.emit('--help');
    }

    else if (this.cmd && argv.help) {

      this.emit(this.cmd + '--help');
    }

    else if (argv.help) {
      this.emit('--help');
    }

    else {

      this.emit(this.cmd);

      for (let index in this.argv)
        if (index !== '_')
          this.emit(this.argv[index]);

    }
  }

  when(evt) {
    let self = this;
    return new Promise(
      function(resolve) {
        self.on(evt, function(payload) {
          resolve(payload);
        });
      }
    );
  }
}

// Place all listeners in start.js

export function configure(argv, cmdDir) {
  if (!program) {
    program = new Program(argv, cmdDir);
    program.emit('start', program.cmd);
  }
  exports.program = program;
  return program;
}

export function command(name, ...args) {
  var cmd = new Command(name, args);
  program.register(cmd);
  return cmd;
}
