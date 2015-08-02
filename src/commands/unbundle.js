import { description, command, args, option } from '../decorators';
import {unbundle} from '../lib/unbundler';


@command('unbundle')
@option('-c, --clear-invalids', 'Only clear the invalid bundle injections')
@description('Unbundles based on bundle config in Aureliafile')
export default class InitCommand {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
  }

  action(opt) {
    this.logger.info('Un bundling ... ');
    unbundle()
      .then(() => {
         this.logger.info('Bundle configuration removed ...');
      });
  }
}
