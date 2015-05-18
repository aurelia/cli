var API = require(__dirname + '/dist/api/index.js');

var _instance;

module.exports = (function(){
  if (!_instance) {
    _instance = new API();
  }
  return _instance;
})();
