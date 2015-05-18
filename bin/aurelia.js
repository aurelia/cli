#!/usr/bin/env node --harmony
const argv     = require('minimist')(process.argv.slice(2));
var chalk      = require('chalk');
var pjson      = require('../package.json');

var AureliaCLI = require('../AureliaCLI.js');

var cli = new AureliaCLI({
  name       : 'aurelia-cli',
  configName : 'Aureliafile',
  argv       : argv,
  cwd        : process.cwd(),
  verbose    : argv.verbose,
  launchFile : 'lib/program.js',
  extensions : require('interpret').jsVariants,
  //   // ^ automatically attempt to require module for any javascript variant
  //   // supported by interpret.  e.g. coffee-script / livescript, etc
  v8flags: ['--harmony'] // to support all flags: require('v8flags')
  //   // ^ respawn node with any flag listed here
});

process.title = cli.processTitle;
process.AURELIA = cli;

var logger = cli.logger

// EVENT init
// This event will be emitted regardless of the users environment.
// If the user is missing the config file
// If the user is missing the locally installed Aurelia-cli
// This function will always be invoked.
cli.initialize(function(program){
  if (argv.verbose) {
    logger.log('LIFTOFF SETTINGS:', this.env);
    logger.log('CLI OPTIONS:', this.env.argv);
    logger.log('CWD:', this.env.cwd);
    // log('LOCAL MODULES PRELOADED:', env.require);
    // log('SEARCHING FOR:', env.configNameRegex);
    logger.log('FOUND CONFIG AT:', this.env.configPath);
    logger.log('CONFIG NAME:', this.env.configName);
    logger.log('YOUR LOCAL MODULE IS LOCATED:', this.env.modulePath);
    logger.log('LOCAL PACKAGE.JSON:', this.env.modulePath);
    logger.log('CLI PACKAGE.JSON', require('../package'));
  }

  program.version(pjson.version)
    .on('--help', function () {
      console.log('\n'
        + '    ' + chalk.bgMagenta(' ') + chalk.bgRed('  ') + chalk.bgMagenta(' ') + '\n'
        + '  ' + chalk.bgRed.black(' aurelia ') + '\n'
        + '    ' + chalk.bgMagenta(' ') + chalk.bgRed('  ') + chalk.bgMagenta(' ') + '\n'
        );
    });

  program.command('new')
    .command('new <type>')
    .description('create a new Aurelia project')
    .action(cli.exec('new'))
    .on('--help', function () {
      log('  Examples:');
      log('');
      log('    // create a new skeleton navigation style app ');
      log('    $ aurelia new navigation');
      log('');
      log('    // create a new aurelia plugin template ');
      log('    $ aurelia new plugin');
      log('');
    });

  program.command('create [name]')
    .option('--env', 'Create a new project environment')
    .option('-l, --level [value]', 'The complexity level of the environment')
    .action(cli.exec('create'))

  program.command('init')
    .description('Initialize a new Aurelia Project')
    .action(cli.exec('init'));

});

// EVENT ready
// This event will only be emitted if the configFile exists and if the locally installed AureliaCLI is installed.
cli.ready(function(program){

  program.command('bundle')
    .alias('b')
    .description('Create a new bundle based on the configuration in Aureliafile.js')
    .option('-a --add <path>', "Add system.js path to files or file to bundle")
    .option('-r --remove <remove_path>', 'Remove file path or file from bundle')
    .option('-l, --list', 'List paths and files included in bundle')
    .action(cli.exec('bundle'));

  program.command('tb')
    .description('experimental template bundler')
    .action(cli.exec('tb'));

  program.command('generate <type>')
    .alias('g')
    .description('Generate new file type based on type specified')
    .option('-n, --name <name>', "Name of the file / class")
    .option('-v, --view', "Create a view for generated file type")
    .option('-i, --inject <name>', "Name of dependency to inject")
    .option('--no-lifecycle', "Do not create lifecycle callbacks, if applicable")
    .option('-t, --template <name>', "Specify the name of the template to use as override")
    .action(cli.exec('generate'))
    .on('--help', function () {
      logger.log('  Examples:');
      logger.log();
      logger.log('    $ aurelia g viewmodel');
      logger.log('    $ aurelia g viewmodel -v -n app.html -i bindable');
      logger.log();
    });

  program.command('plugin <plugin_name>')
    .alias('p')
    .description('List all installed plugins')
    .option('-a, --add <name>', "Add plugin from Aurelia plugin repo")
    .option('-r, --remove <name>', "Disable plugin from project")
    .option('-c, --clear', "Completely remove plugin and files")
    .action(cli.exec('plugin'))
    .on('--help', function () {
      logger.log('  Examples:');
      logger.log();
      logger.log('    $ aurelia plugin -a i18n');
      logger.log('    $ aurelia p -r i18n -c');
      logger.log();
    });
});

// Launch the cli application, which will emit 2 events init and ready.
cli.launch();
