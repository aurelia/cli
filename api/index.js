var fs = require('fs');
var _f = require('fs-utils');
var path = require('path');
var cli = process.AURELIA
var API = function() {

}

fs.readdirSync(__dirname).forEach(function(file) {

  var p     = path.join(__dirname, file);
  var isExt = _f.ext(file) === '.js';

  if ( (_f.isDir(p) || isExt) && file !== 'index.js') {

    var name = isExt ? file.split('.')[0] : file;

    var fn = require(p);

    if (typeof fn === 'function') {
      API.prototype[name] = fn
    }
  }
});

module.exports = API;
