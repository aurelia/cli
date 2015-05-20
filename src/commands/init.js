import * as logger from '../lib/logger';
import {init} from '../lib/init';
var cli    = process.AURELIA;

// INIT
//
// Executable Command that will initialize the directory, and add an AureliaFile if !exists
//
function Init() {
  var options = {};
  options.env = cli.env.argv.env;

  logger.ok('initializing');
  var config = cli.env.isConfig
    ? cli.aurelia._config
    : {env:{}};

  init(config, options);
}
module.exports = Init;
