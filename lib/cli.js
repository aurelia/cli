var program = require('commander');
var bundler = require('./bundler');
var pjson = require('../package.json');
var chalk = require('chalk');
var installer = require('./installer');

var argv, env, aurelia;

module.exports = {
    get argv(){
        return argv;
    },
    get env(){
        return env;
    },
    get aurelia(){
        return aurelia;
    },
    set argv(val){
        argv = val;
    },
    set env(val){
        env = val;
    },
    set aurelia(val){
        aurelia = val;
    },
    init: Init,
    configure: Configure,
    ready: Ready
};

// Init method to be called before Aurelia CLI is launched.
function Init(argv) {

    this.argv = argv;

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

// This method is called the instance Aurelia CLI is Launched.
function Configure(env){

    this.env = env;

    if (argv.verbose) {
        console.log('LIFTOFF SETTINGS:', this);
        console.log('CLI OPTIONS:', argv);
        console.log('CWD:', env.cwd);
        console.log('LOCAL MODULES PRELOADED:', env.require);
        console.log('SEARCHING FOR:', env.configNameRegex);
        console.log('FOUND CONFIG AT:', env.configPath);
        console.log('CONFIG BASE DIR:', env.configBase);
        console.log('YOUR LOCAL MODULE IS LOCATED:', env.modulePath);
        console.log('LOCAL PACKAGE.JSON:', env.modulePackage);
        console.log('CLI PACKAGE.JSON', require('../package'));
    }

    if (process.cwd() !== env.cwd) {
        process.chdir(env.cwd);
        console.log('Working directory changed to', env.cwd);
    }

    if (!env.modulePath) {
        console.log('Local aurelia-cli not found in:', env.cwd);
        process.exit(1);
    }

    if (!env.configPath) {
        console.log('No Aureliafile found.');
    }

};

// Ready Method to be called once the CLI has been configured, and is ready
function Ready(aurelia) {

    this.aurelia = aurelia;

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

    program.parse(process.argv);

};
