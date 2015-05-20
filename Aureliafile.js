var path      = require('path')
  , program = require('commander')
  , chalk = require('chalk')
  ;

var rootDir   = path.join.bind(path, __dirname);
var cliDir    = rootDir.bind(rootDir, 'dist');


var bundler   = require(cliDir('api/bundler'))
  , installer = require(cliDir('api/installer'))
  , pjson     = require(rootDir('package.json'))
  ;


var _instance;

function Aurelia(env) {
  this.env = env;
  this._config = {};
  this._bundle = {};
}

Aurelia.prototype = {
  get configuration(){
    return {config:this._config, bundle:this._bundle};
  },
  set configuration(value){
    this._config = value.config;
    this._bundle = value.bundle;
  }
};

Aurelia.prototype.config = function(config) {
  this._config = config;
};

Aurelia.prototype.bundle = function(bundleConfig) {
  this._bundle = bundleConfig;
};

if (!_instance) {
  _instance = new Aurelia();
}
module.exports = _instance;
