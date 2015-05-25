import {init} from '../lib/init';

export default class InitCommand {

  static register(command){
    command('init')
      .option('-e, --env', 'Initialize an aurelia project environment')
      .description('Initialize a new Aurelia Project and creates an Aureliafile');
  }

  constructor(program, config, logger) {
    this.program      = program;
    this.logger       = logger;
    this.globalConfig = config;
  }

  action(argv, options){
    init(opt, this.globalConfig);
  }
}
