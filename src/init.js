import * as logger from './lib/logger';
import {example} from './lib/utils';
var program = require('./lib/program');
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

  if (env.isCmd('new'))
    program.command('new [type]')
      .description('create a new Aurelia project')
      .action(cli.execute('new'))
      .on('--help', function () {
        example('new', {
          navigation: {
              flags: 'navigation'
            , info : 'create a new skeleton navigation style app'
            , required: true
          },
          plugin: {
              flags: 'plugin'
            , info : 'create a new aurelia plugin template'
            , required: true
          }
        });
      });

  if (env.isCmd('init'))
    program.command('init')
      .option('-e, --env', 'Initialize an aurelia project environment')
      .description('Initialize a new Aurelia Project and creates an Aureliafile')
      .action(cli.execute('init'))
      .on('--help', function(){
        example('init', {
          env: {
              flags: '--env  -e'
            , info : 'Create a new .aurelia project directory.'
            , required: false
          }
        });
      });

    program.parse(process.argv);
}
