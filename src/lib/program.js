var pjson      = require('../package.json')
  , chalk      = require('chalk');

var AureliaCLI = module.exports
  , commands, isCommand, logger, log, Err, Ok;

// AureliaCLI.init
// This function will be invoked regardless of the users environment.
// If the user is missing the config file
// If the user is missing the locally installed Aurelia-cli
// This function will always be invoked.
AureliaCLI.init = function(argv, program) {
  var cli   = this;
  command   = cli.import('commands');
  logger    = cli.logger
  utils     = cli.import('lib/utils');

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
    .command('new <type>')
    .description('create a new Aurelia project')
    .action(command('new'))
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
  // console.log(cli.env)

};
