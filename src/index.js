import {Program} from './lib/program';
import {Store} from './lib/config/store';
import glob from 'glob';
import logger from 'winston';
import BundleCommand from './commands/bundle';
import InitCommand from './commands/init';
import NewCommand from './commands/new';

class Aurelia {

  constructor() {
    this.commands = {};
    this.aliases  = {};
    this.name = 'Aurelia CLI tool';
    this.config = {};
    this.logger = logger;
  }

  init(config) {
    this.program      = new Program(config);
    this.store        = new Store(config);
    this.config       = config;
    this.config.store = this.store;

    this.register(NewCommand);
    this.register(InitCommand);
    this.register(BundleCommand);
  }

  register(Construction) {
    let command   = new Construction(this.config, this.logger);
    Construction.register(this.program.command.bind(this.program, command));
    this.commands[command.commandId] = command;
    this.aliases[command.alias] = command.commandId;
  }

  command(commandId, Construction) {

    if (typeof commandId === 'function') {
      Construction = commandId;
      commandId = null;
    }

    if (commandId && typeof Construction === 'object') {
      this.commands[commandId].commandConfig = Construction;
      return;
    }

    if (typeof Construction === 'function') {
      this.register(Construction);
      return;
    }
  }

  run(argv) {
    var commandId = argv._[0];

    if (this.isCommand(commandId)) {

      if (argv.help) {
        this.program.emit('--help', {commandId:commandId});
      } else {
        this.program.emit('start', {commandId:commandId});
      }
    }
    else if (argv.help) {
      this.program.emit('--help', {all:true});
    }
  }

  isCommand(commandId) {
    return !!this.commands[commandId] || this.aliases[commandId];
  }
}

var inst = new Aurelia();

export default inst;
