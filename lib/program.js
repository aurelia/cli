var bundler = require('./bundler');
var pjson = require('../package.json');
var chalk = require('chalk');
var installer = require('./installer');

var AureliaCLI = module.exports;

// AureliaCLI.init
// This function will be invoked regardless of the users environment.
// If the user is missing the config file
// If the user is missing the locally installed Aurelia-cli
// This function will always be invoked.
AureliaCLI.init = function(argv, env, program) {
    var cli = this;

    if (argv.verbose) {
        console.log('LIFTOFF SETTINGS:', this.settings);
        console.log('CLI OPTIONS:', argv);
        console.log('CWD:', env.cwd);
        console.log('LOCAL MODULES PRELOADED:', env.require);
        console.log('SEARCHING FOR:', env.configNameRegex);
        console.log('FOUND CONFIG AT:', env.configPath);
        console.log('CONFIG BASE DIR:', env.configBase);
        console.log('YOUR LOCAL MODULE IS LOCATED:', env.modulePath);
        console.log('LOCAL PACKAGE.JSON:', env.modulePackage);
        console.log('CLI PACKAGE.JSON', require('../package'));
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
        .action(function(options) {
          console.log('Creating the bundle...')
          console.log('-----------------------------------')
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
          console.log('exec "%s" using %s mode', cmd, options.name);
          console.log('Not yet implemented...');
          console.log('-----------------------------------')
          console.log('  - Generating not yet implemented')
        }).on('--help', function () {
          console.log('  Examples:');
          console.log();
          console.log('    $ aurelia g viewmodel');
          console.log('    $ aurelia g viewmodel -v -n app.html -i bindable');
          console.log();
        });

    program
        .command('plugin <plugin_name>')
        .alias('p')
        .description('List all installed plugins')
        .option('-a, --add <name>', "Add plugin from Aurelia plugin repo")
        .option('-r, --remove <name>', "Disable plugin from project")
        .option('-c, --clear', "Completely remove plugin and files")
        .action(function(cmd, options) {
          console.log('exec "%s" using %s mode', cmd, options.name);
          console.log('Not yet implemented...')
          console.log('-----------------------------------')
          console.log('  - Plugin management not yet implemented')
        }).on('--help', function () {
          console.log('  Examples:');
          console.log();
          console.log('    $ aurelia plugin -a i18n');
          console.log('    $ aurelia p -r i18n -c');
          console.log();
        });

}
