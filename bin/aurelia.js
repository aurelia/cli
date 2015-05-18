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

/*

@/all Ok so here is the deal.

#CLI Update for CLI Team

I have re-structured our code base once again.

##Changes

####1. added API Directory

Originally I asked yall to place all logic that supports each commands in the `commands` However, We need to separate the logic required for the CLI and the logic required for the external API.
So, The command logic will be placed in the commands directory. If you would like to provide a command to the API, require the API in your command file, and use it there.

No worries about refactoring existing commands, I have already done this.

Any logic that can be shared amongst the API and the Command should be placed in the lib directory.

There may be a few kinks to work out, as this PR makes some drastic changes. So please run your code, and make sure it works properly.

If you find issues, then Let me know, or submit a PR to the branch `refactor/cli`;

**NOTE** I have added the bundler to `Api.prototype.bundler` and the installer to `Api.prototype.installer`


####2. added ES6/ES7 support

This is going to require us to run `gulp watch` while developing, to compile our code.

We will have an src directory. This directory will contains the actual ES6 source code.
The output directory is the dist folder.
**NOTE** this the output or source directory can change.

**For Example**
`./src/lib` will be compiled to `./dist/lib`

Please let me know if you have any objections to this.

We now have three directories that we will be working in
`./src/commands`
`./src/lib`
`./src/api`

####3. Removed LiftOff from codebase.

This is another big change, which could have also produced some issues.

Please checkout the Branch, and make sure any code you have written runs properly.

Everything you need for the Environment exists on process.AURELIA.

Please use the term cli when using process.AURELIA.
**Example**
```javascript
var cli = process.AURELIA
```

**process.AURELIA**

Contains the some helpers

Most everything that was provided from lyftOff is now on `cli.env`

Important information about process.AURELIA

```
var cli = process.AURELIA
var env = cli.env;

cli.name           // aurelia-cli
cli.moduleName     // aurelia-cli
cli.aurelia        // An instance of `./Aureliafile.js` at aurelia-cli's root
cli.extensions     // possible extensions required for the Aureliafile
cli.pkg            // aurelia-cli's package.json
cli.mainPath       // Path to file, which is that returns the instance passed to the Aureliafile's function
                   // which is found at the cli's root ./Aureliafile.js
cli.isLaunched     // boolean whether the cli has been launched or not
cli.isAureliaFile  // boolean whether the cli.aurelia has been invoked

cli.root           // function returns path.join('dist', [arguments])
cli.logger         // a simple logger that prefixes and colors our logs
                   Logger.prototype.log  [aurelia]: ## Your message ##
                   Logger.prototype.ok   [aurelia] [Ok]: ## Your message ##
                   Logger.prototype.err  [aurelia] [Err]: ## Your message ##

cli.emit           // bound to program.emit from commanderjs
cli.on             // Promise bound to program.on from commanderjs

cli.launch         // function called in `bin/aurelia` that launches the cli
cli.initialize     // called by cli.launch, but before any local configurations have been checked
cli.ready          // called by cli.launch, Only when and if your local environment has been initialized

cli.import         // function returns requiring the path from the root to your specified module
                   // cli.import('lib/someModule')
cli.exec           // function requires a name parameter, returns a function that when called will require and invoke `command/{name}`
cli.api            // the instance of aurelia-cli api found at api/index.js
cli.store          // config store for reading and writing to the local Aureliafile


env.isConfig       // boolean if config exists
env.isModule       // boolean if local aurelia-cli exists

env.configPath     // path to local Aureliafile
env.configBase     // Base path to local Aureliafile
env.modulePath     // path to local aurelia-cli

env.configFile     // Instance of required local Aureliafile
env.argv           // arguments passed to the cli
env.args           // argv._ an array of arguments passed to the cli.
env.cwd            // The correct cwd
env.ENV            // process.env

```
 */
