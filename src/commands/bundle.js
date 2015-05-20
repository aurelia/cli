var cli     = process.AURELIA;
import * as logger from '../lib/logger';
import {bundle} from '../lib/bundler';

// Bundle
//
// Executable Command for Creating a new bundle based on the configuration in Aureliafile.js
function Bundle(options) {
  var aurelia = require(cli.env.modulePath);
  logger.log('Creating the bundle...');
  logger.log('-----------------------------------');
  bundle(aurelia.bundleConfig);
}

module.exports = Bundle;
