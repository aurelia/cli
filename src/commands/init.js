var cli    = process.AURELIA;
var stream = require('vinyl-fs');
var exists = require('fs').existsSync;
var logger = cli.import('lib/logger');
var ask    = cli.import('lib/ask');
var api    = cli.api;
// INIT
//
// Executable Command that will initialize the directory, and add an AureliaFile if !exists
//
function Init() {
  logger.ok('initializing');
  var config = cli.env.isConfig
    ? cli.aurelia._config
    : false;

  api.init(config);
}
module.exports = Init;
