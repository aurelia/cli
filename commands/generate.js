var cli = process.AURELIA;
var logger  = cli.import('lib/logger');

// Generate
//
// Executable Command for Generating new file type based on type specified
function Generate(cmd, options) {
  logger.log('exec "%s" using %s mode', cmd, options.name());
  logger.log('Not yet implemented...');
  logger.log('-----------------------------------');
  logger.log('  - Generating not yet implemented');
}

module.exports = Generate;
