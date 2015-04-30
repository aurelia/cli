var bundler = require('./bundler');
var pjson = require('../package.json');
var chalk = require('chalk');
var installer = require('./installer');
var AureliaCLI = module.exports;
var commands, isCommand, logger, log, Err, Ok;
// AureliaCLI.init
// This function will be invoked regardless of the users environment.
// If the user is missing the config file
// If the user is missing the locally installed Aurelia-cli
// This function will always be invoked.
AureliaCLI.init = function(argv, env, program) {
    var cli   = this;
    commands  = cli.import('commands')
    logger    = cli.import('lib/logger');
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
    };

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
        .action(function(options) {
          installer.installTemplate('skeleton-navigation');
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

    program
        .command('bundle')
        .alias('b')
        .description('Create a new bundle based on the configuration in Aureliafile.js')
        .option('-a --add <path>', "Add system.js path to files or file to bundle")
        .option('-r --remove <remove_path>', 'Remove file path or file from bundle')
        .option('-l, --list', 'List paths and files included in bundle')
        .action(function(options) {
          log('Creating the bundle...')
          log('-----------------------------------')
          bundler.bundleJS(aurelia.bundleConfig.js);
        });

    program
        .command('tb')
        .description('experimental template bundler')
        .action(function(options) {
          bundler.bundleTemplate(aurelia.bundleConfig.template, aurelia.config);
        });

    program
        .command('generate <type>')
        .alias('g')
        .description('Generate new file type based on type specified')
        .option('-n, --name <name>', "Name of the file / class")
        .option('-v, --view', "Create a view for generated file type")
        .option('-i, --inject <name>', "Name of dependency to inject")
        .option('--no-lifecycle', "Do not create lifecycle callbacks, if applicable")
        .option('-t, --template <name>', "Specify the name of the template to use as override")
        .action(function(cmd, options) {
          log('exec "%s" using %s mode', cmd, options.name);
          log('Not yet implemented...');
          log('-----------------------------------')
          log('  - Generating not yet implemented')
        }).on('--help', function () {
          log('  Examples:');
          log();
          log('    $ aurelia g viewmodel');
          log('    $ aurelia g viewmodel -v -n app.html -i bindable');
          log();
        });

    program
        .command('plugin <plugin_name>')
        .alias('p')
        .description('List all installed plugins')
        .option('-a, --add <name>', "Add plugin from Aurelia plugin repo")
        .option('-r, --remove <name>', "Disable plugin from project")
        .option('-c, --clear', "Completely remove plugin and files")
        .action(function(cmd, options) {
          log('exec "%s" using %s mode', cmd, options.name);
          log('Not yet implemented...')
          log('-----------------------------------')
          log('  - Plugin management not yet implemented')
        }).on('--help', function () {
          log('  Examples:');
          log();
          log('    $ aurelia plugin -a i18n');
          log('    $ aurelia p -r i18n -c');
          log();
        });

}
