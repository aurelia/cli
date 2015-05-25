import {init} from '../lib/init';

export default class InitCommand {
  constructor(program, config, logger) {
    this.program = program;
    this.logger = logger;
    this.commandId = 'init';
    this.globalConfig = config;

    program.command('init')
      .option('-e, --env', 'Initialize an aurelia project environment')
      .description('Initialize a new Aurelia Project and creates an Aureliafile')
      .action((opt) => {
        init(opt, this.globalConfig)
      })
      .on('--help', function() {
        example('init', {
          env: {
            flags: '--env  -e',
            info: 'Create a new .aurelia project directory.',
            required: false
          }
        });
      });
  }
}
