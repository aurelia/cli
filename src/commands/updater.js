import * as logger from '../lib/logger';
import * as updater from '../lib/updater';

var cli = process.AURELIA;

// Updater
//
// Executable Command for updating Aurelia
export function action(options) {
  logger.log(options)
  logger.log('Updating Aurelia...');
  logger.log('-----------------------------------');
  updater.update(options);
}
