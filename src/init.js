import * as logger from './lib/logger';
import {example} from './lib/utils';
var program = require('./lib/program');

import {command} from './lib/exec-command';
var pjson   = require('../package.json');
var cli     = process.AURELIA;
var chalk   = require('chalk');

export function init(env) {

  if (env.argv.verbose) {
    logger.log('LIFTOFF SETTINGS:', env.liftoff);
    logger.log('CLI OPTIONS:', env.argv);
    logger.log('CWD:', env.cwd);
    // log('LOCAL MODULES PRELOADED:', env.require);
    // log('SEARCHING FOR:', env.configNameRegex);
    logger.log('FOUND CONFIG AT:', env.configPath);
    logger.log('CONFIG NAME:', env.configName);
    logger.log('YOUR LOCAL MODULE IS LOCATED:', env.modulePath);
    logger.log('LOCAL PACKAGE.JSON:', env.modulePath);
    logger.log('CLI PACKAGE.JSON', require('../package'));
  }

  // program.version(pjson.version)
  //   .on('--help', function () {
  //     console.log('\n'
  //       + '    ' + chalk.bgMagenta(' ') + chalk.bgRed('  ') + chalk.bgMagenta(' ') + '\n'
  //       + '  ' + chalk.bgRed.black(' aurelia ') + '\n'
  //       + '    ' + chalk.bgMagenta(' ') + chalk.bgRed('  ') + chalk.bgMagenta(' ') + '\n'
  //       );
  //   });

  command('new', '[type]')
    .description('create a new Aurelia project')
    .prompt({
        type: 'list'
      , name: 'template'
      , message: 'Template?'
      , when: function() {
          return !env.args[1]
        }
      , onLoad: true
      , choices: [{
          name: 'navigation',
          value: 'skeleton-navigation'
        },{
          name: 'plugin',
          value: 'skeleton-plugin'
        }]
    })
    .help('new')
    .execute('new')
    .then(function(){
    });

  command('init')
    .option('-e, --env', 'Initialize an aurelia project environment')
    .description('Initialize a new Aurelia Project and creates an Aureliafile')
    .help('init')
    .execute('init')
    .then(function(){
    });

  env.continue = !env.cmd
  env.done(env);
}
