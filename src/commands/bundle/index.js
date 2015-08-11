import bundle from '../../lib/bundler';
import {command, alias, option, description} from '../../decorators';
import _ from 'lodash';

@command('bundle')
@alias('b')
@description('Create a new bundle based on the configuration in Aureliafile.js')
@option('-f, --force', 'Overwrite previous bundle output file.')
export default class BundleCommand {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
  }

  action(opt)  {
   this.logger.info('Creating bundle ...');

   let otheropts = {
      force : opt.force || false,
   };

   let options = _.defaults(this.commandConfig, otheropts);

   bundle(options);

  };
}
