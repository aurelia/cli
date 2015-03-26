var program = require('commander');
var bundler = require('./lib/bundler');

function Aurelia(env) {
  this.env = env;
}

Aurelia.prototype.bundle = function(config) {
  this.bundleConfig = config;
}

Aurelia.prototype.run = function(argv) {
  var self = this;

  program
    .version('0.0.1');

  program
    .command('bundle')
    .description('bundles js modules and templates')
    .action(function(options) {
      bundler.bundleJS(self.bundleConfig.js);
    });

  program
    .command('new')
    .action(function(options) {
      console.log('set a new aurelia project');
    });

  program.parse(argv);
}

module.exports = Aurelia;
