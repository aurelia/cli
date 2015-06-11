import glob from 'glob';
import logger from 'winston';
import program from 'commander';
import fs from 'fs';
import path from 'path';

class Aurelia {
  constructor() {
    this.commands = {};
    this.name = 'Aurelia CLI tool';
    this.config = {};
    this.logger = logger;
  }

  init(config) {
    this.config = config;

    var cmdDir = __dirname + path.sep + 'commands';
    fs.readdirSync(cmdDir)
      .forEach((f) => {
        this._register(require(cmdDir + path.sep + f));
      });
  }

  _register(Command, cmdConfig) {

    let commandName = Command.command;
    let fullCommand = commandName;
    let cmd = new Command(this.config, this.logger);

    let subcommand = Command.args || '';

    if(subcommand !== ''){
        fullCommand = `${commandName} ${subcommand}`;
    }

    let c = program.command(fullCommand);

    c.alias(Command.alias);
    Command.options.forEach(o => {
      c.option(o.opt, o.desc);
    });
    c.description(Command.description);
    c.action(cmd.action.bind(cmd));

    cmd.commandConfig = cmdConfig;
    this.commands[commandName] = cmd;
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
      this._register(Cmd, commandConfig);
      return;
    }
  }

  run(argv) {
    program.parse(argv);
  }
}

var inst = new Aurelia();

export default inst;
