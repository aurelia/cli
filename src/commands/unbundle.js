import { description, command, args, option } from '../decorators';


@command('unbundle')
@option('-c, --clear-invalids', 'Only clear the invalid bundle injections')
@description('Unbundles based on bundle config in Aureliafile')
export default class InitCommand {
  constructor(config, logger) {
    this.config = config;
  }

  action(opt) {
    console.log('Un bundling ... ');
  }
}
