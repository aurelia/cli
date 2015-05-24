import * as utils from './lib/utils';
import * as logger from './lib/logger';
import {example} from './lib/utils';
import {command} from './lib/exec-command';
import {program} from './lib/exec-command';

var cli     = process.AURELIA;

var Promise = require('bluebird');
var pjson   = require('../package.json');
var chalk   = require('chalk');

export function start(env, ready) {

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

  command('new', '[type]')
    .exec('commands/new')
    .description('create a new Aurelia project')
    .prompt('prompt', true)
    .action('action');

  command('init')
    .exec('commands/init')
    .option('-e, --env', 'Initialize an aurelia project environment')
    .description('Initialize a new Aurelia Project and creates an Aureliafile')
    .action('action');


  if (!env.isCommand('init', 'new') && !env.argv.help && !env.isValid) {
    return ready();
  }

  command('bundle')
    .exec('commands/bundle')
    .alias('b')
    .description('Create a new bundle based on the configuration in Aureliafile.js')
    .option('-a --add <path>', "Add system.js path to files or file to bundle")
    .option('-r --remove <remove_path>', 'Remove file path or file from bundle')
    .option('-l, --list', 'List paths and files included in bundle')
    .action('action');

  command('generate','<type>')
    .exec('commands/generate')
    .alias('g')
    .description('Generate new file type based on type specified')
    .option('-n, --name <name>', "Name of the file / class")
    .option('-v, --view', "Create a view for generated file type")
    .option('-i, --inject <list>', "Name of dependency to inject", utils.parseList)
    .option('--no-lifecycle', "Do not create lifecycle callbacks, if applicable")
    .option('-t, --template <name>', "Specify the name of the template to use as override")
    .action('action');

  command('plugin','<plugin_name>')
    .exec('commands/plugin')
    .alias('p')
    .description('List all installed plugins')
    .option('-a, --add <name>', "Add plugin from Aurelia plugin repo")
    .option('-r, --remove <name>', "Disable plugin from project")
    .option('-t, --template <name>', "Disable plugin from project")
    .option('-c, --clear', "Completely remove plugin and files")
    .action('action');

  ready();
}
