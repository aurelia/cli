import program from 'commander';
import glob from 'glob';
import logger from 'winston';

import BundleCommand from './commands/bundle';
import InitCommand from './commands/init';
import NewCommand from './commands/new';

class Aurelia {
  constructor() {
    this.commands = {};
    this.name = 'Aurelia CLI tool';
    this.config = {};
    this.logger = logger;
  }

  init(config) {
    this.config = config;

    this.register(BundleCommand);
    this.register(InitCommand);
    this.register(NewCommand);
  }

  register(Construction) {
    let command   = new Construction(this.config, this.logger);
    Construction.register(this.program.command.bind(this.program, command));
  }

  command(...args) {
    if (typeof args[0] === 'string') {
      let commandId = args[0];
      let config = args[1];
      this.commands[commandId].commandConfig = config;
      return;
    }

    if (typeof args[0] === 'function') {
      let Cmd = args[0];
      let commandConfig = args[1];
      let c = new Cmd(program, this.config, this.logger);
      c.commandConfig = commandConfig;
      this.commands[c.commandId()] = c;
      return;
    }
  }

  run(argv) {
    var commandId = argv._[0];
    if (this.commands[commandId]) {
      this.program.emit(commandId);

      if (argv.help) {
        this.program.emit('--help');
      } else {
        this.program.emit('action');
      }
    }
    else if (argv.help) {
      this.program.emit('--help');
    }
  }
}

var inst = new Aurelia();

export default inst;
