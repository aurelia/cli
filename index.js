var program = require('commander')
  , pjson = require('./package.json')
  , chalk = require('chalk')
  , installer = require('./lib/installer');

var _instance;

function Aurelia(env) {
  this.env = env;
}

Aurelia.prototype.bundle = function(config) {
  this.bundleConfig = config;
};

module.exports = (function(){
  if (!_instance) {
    _instance = new Aurelia();
  }
  return _instance;
})();
