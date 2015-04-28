var program = require('commander');
var bundler = require('./lib/bundler');
var pjson = require('./package.json');
var chalk = require('chalk');
var installer = require('./lib/installer');

function Aurelia(env) {
  this.env = env;
}

Aurelia.prototype.config = function(config) {
  this.config = config;
};

Aurelia.prototype.bundle = function(config) {
  this.bundleConfig = config;
};

Aurelia.prototype.run = function(argv) {
  var self = this;

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
    .command('bundle')
    .alias('b')
    .description('Create a new bundle based on the configuration in Aureliafile.js')
    .option('-a --add <path>', "Add system.js path to files or file to bundle")
    .option('-r --remove <remove_path>', 'Remove file path or file from bundle')
    .option('-l, --list', 'List paths and files included in bundle')
    .action(function(options) {
      console.log('Creating the bundle...')
      console.log('-----------------------------------')
      bundler.bundleJS(self.bundleConfig.js);
    });

  program
    .command('tb')
    .description('experimental template bundler')
    .action(function(options) {
      bundler.bundleTemplate(self.bundleConfig.template, self.config);
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

  program
    .command('new')
    .description('create a new Aurelia project')
    .action(function(options) {
      installer.installTemplate('skeleton-navigation');
    });

  program.parse(argv);
};


module.exports = Aurelia;
