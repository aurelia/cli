'use strict';

var cli = process.AURELIA;
var logger = cli['import']('lib/logger');

function Bundle(options) {
  var aurelia = require(cli.env.modulePath);
  var bundler = cli['import']('lib/bundler');
  logger.log('Creating the bundle...');
  logger.log('-----------------------------------');
  bundler.bundle(aurelia.bundleConfig);
}

module.exports = Bundle;