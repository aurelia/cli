var path = require('path');
var libDir = path.join.bind(path, __dirname, 'dist', 'lib');
var cwd = path.join.bind(path, process.cwd());
var _api;

var local = {
    pkg: require(cwd('package.json'))
};

var Api = function() {
  this.logger = require(libDir('logger'));
  this._config = {};
  this._bundle = {};

};

Api.prototype = {
  get bundler() {
    return require(libDir('bundler'));
  },
  get installer() {
    return require(libDir('installer'));
  },
  get configuration() {
    return {config: this._config, bundle: this._bundle};
  },
  set configuration(data) {
    this._config = data.config;
    this._bundle = data.bundle;
  }
};

Api.prototype.config = function(data) {
  this._config = data;
};

Api.prototype.bundle = function(data) {
  this._bundle = data;
};

module.exports = (function() {
  if (!_api) {
    _api = new Api();
  }
  return _api;
})();
