var cli = process.AURELIA;
var logger  = cli.import('lib/logger');
var bundler = cli.import('lib/bundler');

// Bundle
//
// Executable Command for Creating a new bundle based on the configuration in Aureliafile.js
function Bundle(options) {
    var aurelia = require(cli.env.modulePath);
    logger.log('Creating the bundle...');
    logger.log('-----------------------------------');
    bundler.bundleJS(aurelia.bundleConfig.js);
}

module.exports = Bundle;
