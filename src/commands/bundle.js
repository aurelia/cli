var cli     = process.AURELIA;
var logger  = cli.import('lib/logger');

// Bundle
//
// Executable Command for Creating a new bundle based on the configuration in Aureliafile.js
function Bundle(options) {
  var aurelia = require(cli.env.modulePath);
  var bundler = cli.import('lib/bundler');
  logger.log('Creating the bundle...');
  logger.log('-----------------------------------');
  bundler.bundle(aurelia.bundleConfig);
}

module.exports = Bundle;
