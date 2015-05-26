let argv, env, program;
import extend from 'lodash/object/extend';
import repeat from 'lodash/string/repeat';
import {ask} from './ask';
var Promise      = require('bluebird');
var EventEmitter = require('events').EventEmitter;

export class Command{

  constructor(Construction, commandId) {
    var self = this;
    this.context = this.createContext(Construction, commandId);
    this._readyCallbacks = [];
    this._prompts = this.context.prompts || [];

    program.on('start', function(payload) {
      if (payload.commandId === commandId)
        self.onReady(function(){
          self._runAction();
        });
    });
    program.on('--help', function(payload){
      if (payload.commandId === commandId || payload.all)
        self.onReady(function(){
          self.context.help();
        });
    });
    return this;
  }

  onReady(cb) {
    this._readyCallbacks.forEach(function(fn){fn();});
    cb.call(this);
  }

  createContext (Construction, commandId){

    for (let proto in Construction.prototype) {
        if(/^(on)/.test(proto)) {
          var eventName = proto.slice(2);
              eventName = eventName[0].toLowerCase() + eventName.slice(1);
              this._onEvent(proto, eventName);
        }
    }
    Construction.commandId = commandId;
    Construction.argv    = {_:[]};
    Construction._args   = argv._.slice(1);
    Construction.args    = {};
    Construction.options = {};
    Construction.help    = Construction.help || this._help.bind(Construction, console.log, Construction.argv, Construction.options);
    Construction.prompts = Construction.prompts || {};
    return Construction;
  }
  _ready(fn) {
    this._readyCallbacks.push(fn.bind(this));
  }

  _onEvent(proto, evt){
    program.on(evt, function(payload){
      this.context[proto].bind(this.context)(payload);
    }.bind(this));
  }
  _option(flags, info, parseFn, name, alias){
    var value = argv[name] || argv[alias];
    var isRequired = /</.test(flags);
    var isOptional = /\[/.test(flags);
    var getValue, prototypeName = parseFn;
    parseFn = function(){return value;};

    getValue = function(protoName) {
      return function() {
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

    this.context.options[name] = {
        name : name
      , alias: alias
      , info : info
      , flags:flags
      , required : isRequired
      , optional : isOptional
      , get value() {
          return parseFn();
        }
    };

    if (value)
      this.context.argv[name] = this.options[name].value;

    return this;
  }
  option(flags, info, parseFn){
    var self = this;
    if (flags.length > program.maxFlags) {
      program.maxFlags = flags.length;
    }
    var name  = flags.match(/\-\-(\w+)/)[1];
    var alias = flags.match(/^\-(\w+)/)[1];

    this._ready(function(){
      if (argv[name] || argv[alias] || argv.help) {
        self._option(flags, info, parseFn, name, alias);
      }
    });
    return this;
  }

  arg(str) {
    var name = str.match(/(\w+)/)[0];
    var isRequired = /</.test(str);
    var isOptional = /\[/.test(str);
    var value = this.context._args.shift();

    if (value) {
      this.context.argv[name] = value;
      this.context.argv._.push(value);
    }
    this.context.commandArgs = this.context.commandArgs || '';
    this.context.commandArgs += ' ' + str;
    return this;
  }

  alias(str) {
    this.context.alias = str;
    if ((argv._[0] === str) && arg._[0] !== this.context.commandId) {
      argv._[0] = this.context.commandId;
    }
    return this;
  }

  description(text) {
    this.context.description = text;
    return this;
  }
  _runPrompt() {

    var self = this;
    if(this.context.prompt) {
      return this.context.prompt(ask, this.argv, self.options, self._prompts);
    }
    if (this._prompts.length) {
      return ask(self._prompts);
    }
  }
  prompt(stringFN) {
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
  beforeAction(stringFN){
    if (typeof stringFN === 'string') {
      if (stringFN === 'prompt') {
        this._beforeAction = this._runPrompt;
      } else if(this.isPrototype(stringFN)) {
        this._beforeAction = this.context[str].bind(this.context);
      }
    } else if (typeof stringFN === 'function') {
      this._beforeAction = stringFN.bind(this);
    }
    return this;
  }
  _runAction(){
    var self = this;
    return Promise.resolve()
      .then(function(){
        if (self._beforeAction)
          return self._beforeAction(self.context.argv, self.context.options);

        if (self.context.beforAction && typeof self.context.beforAction === 'function')
          return self.context.beforAction(self.context.argv, self.context.options);

        return;
      })
      .then(function(before){
        return self.context.action(self.context.argv, self.context.options, before);
      })
      .then(function(action){
        if (self.context.afterAction && typeof self.context.afterAction)
          return self.context.afterAction(self.context.argv, self.context.options, action);
        return;
      });
  }
  action(stringFN) {
    if (typeof stringFN === 'string' && this.isPrototype(stringFN)) {
      this.context.action = this.context[stringFN];
    } else if (typeof stringFN === 'function') {
      this.context.action = stringFN.bind(this.context);
    } else {
      this.context.action = this.context.action || function(){return console.log('No Action found for command %s', this.name);}.bind(this);
    }
    return this;
  }

  help(stringFN) {
    if (typeof stringFN === 'string' && this.isPrototype(stringFN)) {
      this.context.help = this.context[stringFN];
    } else if (typeof stringFN === 'function') {
      this.context.help = stringFN.bind(this.context);
    } else {
      this.context.help = this.context.help || this._help.bind(this.context, console.log);
    }
    return this;
  }

  _help(log, argv, options) {
    var isFlags;
    log();
    log('@%s %s', 'command'.green, this.commandId);

    if (this.commandArgs)
      log('@%s %s', 'args  '.green, this.commandArgs);

    log('@%s %s', 'info   '.green, this.description);


    for (let index in options) {
      if (!isFlags)
        log('@%s', 'flags  '.green);

      isFlags = true;
      let option = options[index];
      let padding = repeat(' ', program.maxFlags - option.flags.length);

      log('   '+option.flags.cyan + padding, option.required ? 'required'.red : 'optional'.green, option.info);
    }
    log();
  }

  isPrototype(name) {
    return typeof name === 'string' && typeof this.context[name] === 'function';
  }
}


export class Program extends EventEmitter{

  constructor(config) {
    super();
    program = this;
    argv = config.argv;
    this.maxFlags = 0;
  }

  command(cmd, cmdId) {
    let commandId = commandId;
    var command = new Command(cmd, cmdId);
    return command;
  }
}

