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

module.exports = Aurelia;
