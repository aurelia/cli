import { description, command, args, option, alias } from '../decorators';
import {unbundle} from '../lib/unbundler';
import _ from 'lodash';


@command('unbundle')
@alias('u')
@option('-r, --remove-files', 'Remove bundle files.')
@description('Unbundles based on bundle config in Aureliafile')
export default class InitCommand {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
  }

  action(opt) {

    let otherOpts = {
       clearInvalids : opt.clearInvalids || false,
       removeFiles : opt.removeFiles || false
    };

    let options = _.defaults(this.commandConfig, otherOpts);

    this.logger.info('Un bundling ... ');

    unbundle(options)
      .then(() => {
         this.logger.info('Bundle configuration removed! ...');
      });
  }
}
