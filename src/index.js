import glob from 'glob';
import logger from 'winston';
import program from 'aurelia-command';
import BundleCommand from './commands/bundle';
import InitCommand from './commands/init';
import NewCommand from './commands/new';
import GenerateCommand from './commands/generate';

class Aurelia {
  constructor() {
    this.commands = {};
    this.name = 'Aurelia CLI tool';
    this.config = {};
    this.logger = logger;
  }

  init(config) {
    this.config = config;
    program.init(config);
    program.register(BundleCommand, this.logger, this.config);
    program.register(InitCommand, this.logger, this.config);
    program.register(NewCommand, this.logger, this.config);
    program.register(GenerateCommand, this.logger, this.config);
  }

  command(commandId, Construction) {
    if (typeof commandId === 'function') {
      Construction = commandId;
      commandId = null;
    }

    if (commandId && typeof Construction === 'object') {
      this.program.commands[commandId].commandConfig = Construction;
      return;
    }

    if (typeof Construction === 'function') {
      program.register(Construction);
      return;
    }
  }

  run(argv) {
    program.start(argv);
  }
}

var inst = new Aurelia();

export default inst;
