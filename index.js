var program = require('commander')
  , bundler = require('./lib/bundler')
  , pjson = require('./package.json')
  , chalk = require('chalk')
  , installer = require('./lib/installer');

var _instance;

function Aurelia(env) {
  this.env = env;
}

Aurelia.prototype.config = function(config) {
  this._config = config;
};

Aurelia.prototype.bundle = function(config) {
  this.bundleConfig = config;
};

  if (!_instance) {
    _instance = new Aurelia();
  }
module.exports = _instance;
