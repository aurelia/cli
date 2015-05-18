'use strict';

var cli = process.AURELIA;
var logger = cli['import']('lib/logger');

function Bundle(options) {
  var aurelia = require(cli.env.modulePath);
  logger.log('Creating the bundle...');
  logger.log('-----------------------------------');
  cli.api.bundler.bundleJS(aurelia.bundleConfig.js);
}

module.exports = Bundle;