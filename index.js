var path = require('path');

var libDir = path.join.bind(path, __dirname, 'dist', 'lib');

var Api = function() {
  this.logger = require(libDir('logger'));
}

Api.prototype = {
  get bundler() {
    return require(libDir('bundler'))
  },
  get installer() {
    return require(libDir('installer'))
  }
}

module.exports = (function() {
  if (!_api) {
    _api = new Api();
  }
  return _api;
})();
