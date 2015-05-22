import * as logger from '../lib/logger';

var cli     = process.AURELIA;

// Plugin
//
// Executable Command for Listing all installed plugins
export function action(cmd, opts) {
  logger.log('exec "%s" using %s mode', cmd, opts.name());
  logger.log('Not yet implemented...');
  logger.log('-----------------------------------');
  logger.log('  - Plugin management not yet implemented');
}
