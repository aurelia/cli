let argv, env, program;
import extend from 'lodash/object/extend';
import repeat from 'lodash/string/repeat';
var EventEmitter = require('events').EventEmitter;

export class Command{

  constructor(Construction, commandId) {
    this.context = this.createContext(Construction, commandId);

    return this;
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
    Construction.options = {};
    Construction.help    = this._help.bind(Construction, console.log, Construction.argv, Construction.options);
    return Construction;
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
    program.on('--'+name, function(){
      self._option(flags, info, parseFn, name, alias);
    });
    program.on('-'+alias, function(){
      program.emit('--'+name);
    });
    program.on('help', function(){
      program.emit('--'+name);
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

  prompt(stringFN) {
    if (typeof stringFN === 'string' && this.isPrototype(stringFN)) {
      this.context.prompt = this.context[stringFN];
    } else if (typeof stringFN === 'function') {
      this.context.prompt = stringFN.bind(this.context);
    } else {
      this.context.prompt = this.context.prompt || function(){return console.log('No Prompt found for command %s', this.name);}.bind(this);
    }
    return this;
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
  }

  _help(log, argv, options) {
    log();
    log('@%s %s', 'command'.green, this.commandId);
    log('@%s %s', 'info   '.green, this.description);
    var isFlags;
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

