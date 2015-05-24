import * as logger from '../lib/logger';
import {init} from '../lib/init';
var cli    = process.AURELIA;

// INIT
//
// Executable Command that will initialize the directory, and add an AureliaFile if !exists
export function action(cmd, options) {
  console.log(cli.argv.env)
  var config;
  var options = {
    env: cli.argv.env
  };

  logger.ok('initializing');

  if ( cli.env.configPath )
    config = cli.aurelia._config;
  else
    config = {env:{}};

  return init(config, options);
}
