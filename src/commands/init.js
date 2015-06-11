import { init } from '../lib/init';
import { description, command, args, option } from '../decorators';


@command('init')
@option('-e, --env', 'Initialize an aurelia project environment')
@description('Initialize a new Aurelia Project and creates an Aureliafile')
export default class InitCommand {
  constructor(config, logger) {
    this.config = config;
  }

  action(opt) {
    init(opt, this.config)
  }
}
