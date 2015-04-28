var program = require('commander');
var bundler = require('./bundler');
var pjson = require('../package.json');
var chalk = require('chalk');
var installer = require('./installer');
var path = require('path');

// process.env.AURELIA && process.AURELIA is an OS switch board
// Some OS's have different symlinks than others. This switch helps provide the correct environment
// for most OS's, Especially those who have difficulties matching the symlinks of a Macintosh Computer.
// For Example, ./ does not work properly on some Linux machines, yet works across all Apple computers.
// This switch solves this issue by providing either or options.
// The default return values are based on the configurations of an Apple Computer.
process.env.AURELIA = process.env.AURELIA = {};
process.AURELIA = CLI = {
    get argv(){
        return process.env.AURELIA.argv || this._argv;
    },
    get env(){
        return process.env.AURELIA.env || this._env;
    },
    get aurelia(){
        return process.env.AURELIA.instance || this._instance;
    },
    set argv(val){
        this._argv = val;
        process.env.AURELIA.argv = val;
    },
    set env(val){
        this._env = val;
        process.env.AURELIA.env = val;
    },
    set aurelia(val){
        this._instance = val;
        process.env.AURELIA.instance = val;
    },
    root: path.join.bind(path, __dirname, '../'),
    // Import
    // This method helps resolve incorrect symlinks based on the user's platform.
    // By using __dirname, from root, along with node's path module, we are able to overwrite
    // most common issues.
    //
    // Therefore, in order to require modules throughout the cli application, simply do the following
    // var cli = process.AURELIA
    // cli.import(/*path from root to module*/)
    //
    // If requiring a typical node_module, you can use the default require statement.
    import: function (dir) {
        return require(this.root(dir));
    }
}

// Configure
// Configure handles lyftOff.launch for us.
// Simply pass the original object the Lyftoff module requires, along with two extra options, and without the callback
//
// LaunchFile: The file to use/invoke, when lyftoff is ready.
// argv: The original argv created from the executable file.
module.exports.configure = function(options) {

    // Apply the argv to the process environment
    CLI.argv = options.argv;

    // Launch LyftOff.
    options.Lyftoff.launch({
        cwd: options.cwd,
        configPath: options.configPath,
        require: options.require,
        completion: options.completion,
        verbose: options.verbose
    }, function(env){

        // Apply LyftOff's env and settings to the process environment.
        CLI.env = env;
        CLI.settings = this;
        // Require the LuanchFile for executing based on user's CWD
        var launchFile = require(CLI.root(options.launchFile))

        // Change the CWD if it does not match the PWD of the local configFile
        if (process.cwd() !== env.cwd) {
            process.chdir(env.cwd);
            console.log('Working directory changed to', env.cwd);
        };

        // Execute the LunchFile's init function,
        // Pass the argv, LyftOff's env, and program/Commander.js
        launchFile.init.bind(CLI)(options.argv, env, program)

        // If the local module is not found, go ahead and parse commander's options
        if (!env.modulePath) {
            console.log('Local aurelia-cli not found in:', env.cwd);
            program.parse(process.argv);
            return;
        }

        // If the local configFile is not found, go ahead and parse commander's options
        if (!env.configPath) {
            console.log('No Aureliafile found.');
            program.parse(process.argv);
            return;
        }

        // Otherwise, execute the LaunchFile's ready function and parse Commander's options
        launchFile.ready.bind(CLI)(options.argv, env, program);
        program.parse(process.argv);
    });
};
