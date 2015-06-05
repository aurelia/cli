import * as logger from '../lib/logger';
import * as updater from '../lib/updater';

export default class UpdateCommand {
  constructor(program, config, logger) {
    this.program = program;
    this.logger = logger;
    this.commandId = 'update';
    this.globalConfig = config;
    this.commandConfig = {};

    program.command('update')
      .alias('u')
      .description('Update aurealia')
      .option('-n --nuclear', "Go nuclear")
      .action((opts) => {
        logger.log('Updating Aurelia...');
        logger.log('-------------------------');
        updater.update(opts);
      });
  }
}
