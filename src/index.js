import program from 'commander';
import logger from 'winston';
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
        var Cmd = require(cmdDir + path.sep + f);
        let c = new Cmd(program, this.config, this.logger);
        this.commands[c.commandId] = c;
      });
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
