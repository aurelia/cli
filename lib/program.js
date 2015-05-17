var pjson      = require('../package.json')
  , chalk      = require('chalk');

var AureliaCLI = module.exports
  , commands, isCommand, logger, log, Err, Ok;

// AureliaCLI.init
// This function will be invoked regardless of the users environment.
// If the user is missing the config file
// If the user is missing the locally installed Aurelia-cli
// This function will always be invoked.
AureliaCLI.init = function(argv, env, program) {
  var cli   = this;
  commands  = cli.import('commands');
  logger    = cli.import('lib/logger');
  utils     = cli.import('lib/utils');
  log       = logger.log;
  Ok        = logger.ok;
  Err       = logger.err;
  isCommand = function(arg) {
    return argv._[0] === arg
  };

  if (argv.verbose) {
    log('LIFTOFF SETTINGS:', this.settings);
    log('CLI OPTIONS:', argv);
    log('CWD:', env.cwd);
    log('LOCAL MODULES PRELOADED:', env.require);
    log('SEARCHING FOR:', env.configNameRegex);
    log('FOUND CONFIG AT:', env.configPath);
    log('CONFIG BASE DIR:', env.configBase);
    log('YOUR LOCAL MODULE IS LOCATED:', env.modulePath);
    log('LOCAL PACKAGE.JSON:', env.modulePackage);
    log('CLI PACKAGE.JSON', require('../package'));
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

  isCommand('new') && program
  .command('new <type>')
  .description('create a new Aurelia project')
  .action(commands('new'))
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

  isCommand('init') && program
  .command('init')
  .description('Initialize a new Aurelia Project')
  .action(commands('init'));
};

// AureliaCLI.ready()
// This function will only be invoked if the configFile exists and if the locally installed AureliaCLI is installed.
AureliaCLI.ready = function(argv, env, program) {
  var cli = this;

  var aurelia = require(env.modulePath);
  require(env.configPath)(aurelia);

  isCommand('bundle') && program
  .command('bundle')
  .alias('b')
  .description('Create a new bundle based on the configuration in Aureliafile.js')
  .option('-a --add <path>', "Add system.js path to files or file to bundle")
  .option('-r --remove <remove_path>', 'Remove file path or file from bundle')
  .option('-l, --list', 'List paths and files included in bundle')
  .action(commands('bundle'));

  isCommand('generate') && program
  .command('generate <type>')
  .alias('g')
  .description('Generate new file type based on type specified')
  .option('-n, --name <name>', "Name of the file / class")
  .option('-v, --view', "Create a view for generated file type")
  .option('-i, --inject <list>', "Name of dependency to inject", utils.parseList)
  .option('--no-lifecycle', "Do not create lifecycle callbacks, if applicable")
  .option('-t, --template <name>', "Specify the name of the template to use as override")
  .action(commands('generate'))
  .on('--help', function () {
    log('  Examples:');
    log();
    log('    $ aurelia g viewmodel');
    log('    $ aurelia g viewmodel -v -n app.html -i bindable');
    log();
  });

  isCommand('plugin') && program
  .command('plugin <plugin_name>')
  .alias('p')
  .description('List all installed plugins')
  .option('-a, --add <name>', "Add plugin from Aurelia plugin repo")
  .option('-r, --remove <name>', "Disable plugin from project")
  .option('-c, --clear', "Completely remove plugin and files")
  .action(commands('plugin'))
  .on('--help', function () {
    log('  Examples:');
    log();
    log('    $ aurelia plugin -a i18n');
    log('    $ aurelia p -r i18n -c');
    log();
  });
};
