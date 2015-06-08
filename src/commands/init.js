import {command, option, description} from 'aurelia-command';
import {init} from '../lib/init';

@command('init')
@option('-e, --env', 'Initialize an aurelia project environment')
@description('Initialize a new Aurelia Project and creates an Aureliafile')
export default class InitCommand {

  constructor(config, logger) {
    this.logger = logger;
    this.commandId = 'init';
    this.globalConfig = config;
  }

  beforeAction(){
    console.log('before');
  }

  action(argv, options, before){
    console.log('action');
    return init(argv, this.globalConfig);
  }

  afterAction(argv, options, result){
    console.log('after');
  }
}
