var bundler    = require('./bundler');
var pjson      = require('../package.json');
var chalk      = require('chalk');
var installer  = require('./installer');
var AureliaCLI = module.exports;
var commands, isCommand, logger, log, Err, Ok;

// AureliaCLI.init
// This function will be invoked regardless of the users environment.
// If the user is missing the config file
// If the user is missing the locally installed Aurelia-cli
// This function will always be invoked.
AureliaCLI.init = function(argv, program) {
  var cli   = this;
  command   = cli.import('commands');
  logger    = cli.logger

  if (argv.verbose) {
    logger.log('LIFTOFF SETTINGS:', this.settings);
    logger.log('CLI OPTIONS:', this.argv);
    logger.log('CWD:', this.cwd);
    // log('LOCAL MODULES PRELOADED:', env.require);
    // log('SEARCHING FOR:', env.configNameRegex);
    logger.log('FOUND CONFIG AT:', this.env.configPath);
    logger.log('CONFIG NAME:', this.env.configName);
    logger.log('YOUR LOCAL MODULE IS LOCATED:', this.modulePath);
    logger.log('LOCAL PACKAGE.JSON:', this.modulePath);
    logger.log('CLI PACKAGE.JSON', require('../package'));
  }

  program
    .version(pjson.version)
    .on('--help', function () {
      console.log('\n'
        + '    ' + chalk.bgMagenta(' ') + chalk.bgRed('  ') + chalk.bgMagenta(' ') + '\n'
        + '  ' + chalk.bgRed.black(' aurelia ') + '\n'
        + '    ' + chalk.bgMagenta(' ') + chalk.bgRed('  ') + chalk.bgMagenta(' ') + '\n'
        );
    });

  program
    .command('new')
    .description('create a new Aurelia project')
    .action(command('new'));

  program
    .command('create [name]')
    .option('--env', 'Create a new project environment')
    .option('-l, --level [value]', 'The complexity level of the environment')
    .action(command('create'))

  program
    .command('init')
    .description('Initialize a new Aurelia Project')
    .action(command('init'));

};

// AureliaCLI.ready()
// This function will only be invoked if the configFile exists and if the locally installed AureliaCLI is installed.
AureliaCLI.ready = function(argv, env, program) {
  var cli = this;

  program
    .command('bundle')
    .alias('b')
    .description('Create a new bundle based on the configuration in Aureliafile.js')
    .option('-a --add <path>', "Add system.js path to files or file to bundle")
    .option('-r --remove <remove_path>', 'Remove file path or file from bundle')
    .option('-l, --list', 'List paths and files included in bundle')
    .action(command('bundle'));

  program
    .command('tb')
    .description('experimental template bundler')
    .action(command('tb'));

  program
    .command('generate <type>')
    .alias('g')
    .description('Generate new file type based on type specified')
    .option('-n, --name <name>', "Name of the file / class")
    .option('-v, --view', "Create a view for generated file type")
    .option('-i, --inject <name>', "Name of dependency to inject")
    .option('--no-lifecycle', "Do not create lifecycle callbacks, if applicable")
    .option('-t, --template <name>', "Specify the name of the template to use as override")
    .action(command('generate'))
    .on('--help', function () {
      logger.log('  Examples:');
      logger.log();
      logger.log('    $ aurelia g viewmodel');
      logger.log('    $ aurelia g viewmodel -v -n app.html -i bindable');
      logger.log();
    });

  program
    .command('plugin <plugin_name>')
    .alias('p')
    .description('List all installed plugins')
    .option('-a, --add <name>', "Add plugin from Aurelia plugin repo")
    .option('-r, --remove <name>', "Disable plugin from project")
    .option('-c, --clear', "Completely remove plugin and files")
    .action(command('plugin'))
    .on('--help', function () {
      logger.log('  Examples:');
      logger.log();
      logger.log('    $ aurelia plugin -a i18n');
      logger.log('    $ aurelia p -r i18n -c');
      logger.log();
    });
};
