import program from 'commander';
import glob from 'glob';
import logger from 'winston';

import BundleCommand from './commands/bundle';
import InitCommand from './commands/init';
import NewCommand from './commands/new';
import GenerateCommand from './commands/generate';
import UpdateCommand from './commands/updater';

class Aurelia {
  constructor() {
    this.commands = {};
    this.name = 'Aurelia CLI tool';
    this.config = {};
    this.logger = logger;
  }

  init(config) {
    this.config = config;
    let bundle = new BundleCommand(program, this.config, this.logger);
    let init = new InitCommand(program, this.config, this.logger);
    let newCmd = new NewCommand(program, this.config, this.logger);
    let generateCmd = new GenerateCommand(program, this.config, this.logger);
    let updateCmd = new UpdateCommand(program, this.config, this.logger);

    this.commands[bundle.commandId] = bundle;
    this.commands[init.commandId] = init;
    this.commands[newCmd.commandId] = newCmd;
    this.commands[generateCmd.commandId] = generateCmd;
    this.commands[updateCmd.commandId] = updateCmd;
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
      this.commands[c.commandId] = c;
      return;
    }
  }

  run(argv) {
    program.parse(argv);
  }
}

var inst = new Aurelia();

export default inst;
