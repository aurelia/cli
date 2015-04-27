var bundler = require('./lib/bundler');
var pjson = require('./package.json');
var chalk = require('chalk');

// the Aurelia-cli instance.
var _aurelia;

function Aurelia() {}

Aurelia.prototype.config = function(config) {
  this.config = config;
}

Aurelia.prototype.bundle = function(config) {
  this.bundleConfig = config;
}

Aurelia.prototype.constructor = Aurelia;

// Create and export a new instance if necessary.
if (!_aurelia) {
  _aurelia = new Aurelia();
}

module.exports = _aurelia;
