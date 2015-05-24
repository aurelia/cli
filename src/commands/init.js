import * as logger from '../lib/logger';
import {init} from '../lib/init';
import {example} from '../lib/utils';
var cli    = process.AURELIA;

// INIT
//
// Executable Command that will initialize the directory, and add an AureliaFile if !exists
export function action(cmd, options) {
  var opts = {
    env: cli.argv.env
  };

  logger.ok('initializing');

  var config = cli.env.isValid
    ? cli.env.aurelia.configuration
    : false;

  return init(config, opts);
}


export function help() {
    example('init', {
      env: {
          flags: '--env  -e'
        , info : 'Create a new .aurelia project directory.'
        , required: false
      }
    });
}
