let argv, env, program;
import extend from 'lodash/object/extend';
import repeat from 'lodash/string/repeat';
import {ask} from '../ask';
var Promise      = require('bluebird');

export class Command{

  /*
      constructor
      @param parent    program
      @param config    globalConfig

      @Event start     Check if is current command
                       Call pareOptions to parse options
                       run _runAction()

      @Event --help    Check if is current command or if all commands
                       Call pareOptions to parse options
                       run context.help()

   */
  constructor(parent, config) {
    var self = this;
    program = parent;
    argv    = config.argv;
    this.program  = program;
    this._readyCallbacks = [];

    program.on('start', function(payload) {
      if (payload.commandId === self.context.commandId || payload.commandId === self.context.alias) {
        self.pareOptions();
        self._runAction();
      }
    });

    program.on('--help', function(payload){
      if (payload.all || payload.commandId === self.context.commandId || payload.commandId === self.context.alias) {
        self.pareOptions();
        self.context.help();
      }
    });

    return this;
  }

  /*
      pareOptions
      Parse all contained options

   */
  pareOptions() {
    this._readyCallbacks.forEach(function(fn){fn();});
  }

  /*
      Create context
      @param Construction {Constructor} The CustomCommand Constructor.
      @param commandId    {String}      The name of the command;
   */
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
    Construction._args   = argv._.slice(1) || [];
    Construction.args    = {};
    Construction.options = {};
    Construction.help    = Construction.help || this._help.bind(Construction, console.log, Construction.argv, Construction.options);
    Construction.prompts = Construction.prompts || [];
    this._prompts = Construction.prompts;
    this.context = Construction;
    return Construction;
  }

  // Called by option that pushed the function into an array to be called on parseOptions
  _ready(fn) {
    this._readyCallbacks.push(fn.bind(this));
  }

  // Handles events bound to the specific command
  _onEvent(proto, evt){
    program.on(evt, function(payload){
      this.context[proto].bind(this.context)(payload);
    }.bind(this));
  }

  option(flags, info, parseFn){
    var self = this;
    if (flags.length > program.maxFlags) {
      program.maxFlags = flags.length;
    }

    this._ready(function(){

      if (!parseFn || typeof parseFn !== 'function') {
        parseFn = function(c){return c;};
      }
      var value;
      var option = {
          name     : flags.match(/\-\-(\w+)/)[1]
        , alias    : flags.match(/^\-(\w+)/)[1]
        , flags    : flags
        , info     : info
        , required : /</.test(flags)
        , optional : /\[/.test(flags)
        , get value() {
            return parseFn(value);
          }
      };

      value = argv[option.name] || argv[option.alias];

      if (value !== undefined)
        if (argv[option.name] || argv[option.alias] || argv.help)
            self.context.argv[option.name] = option.value;

      self.context.options[option.name] = option;

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
    if ((argv._[0] === str) && argv._[0] !== this.context.commandId) {
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

