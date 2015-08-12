import * as logger from '../lib/logger';
import * as updater from '../lib/updater';
import {command, option, alias, description } from '../decorators';


@command('update')
@alias('u')
@description('Update Aurelia')
@option('-n --nuclear', "Go nuclear")
export default class UpdateCommand {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
  }

  action(opts) {
    logger.log('Updating Aurelia...');
    logger.log('-------------------------');
    updater.update(opts);
  };
}
