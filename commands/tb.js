var cli     = process.AURELIA;
var logger  = cli.import('lib/logger');
var bundler = cli.import('lib/bundler');

// TB
//
// Executable Command : experimental template bundler
function tb(options) {
  var aurelia = require(cli.env.modulePath);
  var config =  aurelia.bundleConfig.template;

  var pattern = config['pattern'];
  var outfile = config['outfile'];

  bundler.bundleTemplate(pattern, outfile);
}

module.exports = tb;
