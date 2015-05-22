import * as logger from '../lib/logger';
import {init} from '../lib/init';
var cli    = process.AURELIA;

// INIT
//
// Executable Command that will initialize the directory, and add an AureliaFile if !exists
export function action() {
  var options = {
    env: cli.argv.env
  };

  logger.ok('initializing');

  var config = cli.env.configPath
    ? cli.aurelia._config
    : {env:{}};

  return init(config, options);
}
