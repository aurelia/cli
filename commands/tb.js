var cli = process.AURELIA;
var logger  = cli.import('lib/logger');
var bundler = cli.import('lib/bundler');

// TB
//
// Executable Command : experimental template bundler
function tb(options) {
  var aurelia = require(cli.env.modulePath);
  bundler.bundleTemplate(aurelia.bundleConfig.template, aurelia.config);
}

module.exports = tb;
