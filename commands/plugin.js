var cli = process.AURELIA;
var logger  = cli.import('lib/logger');

// Plugin
//
// Executable Command for Listing all installed plugins
function Plugin(cmd, options) {
  logger.log('exec "%s" using %s mode', cmd, options.name());
  logger.log('Not yet implemented...');
  logger.log('-----------------------------------');
  logger.log('  - Plugin management not yet implemented');
}

module.exports = Plugin;
