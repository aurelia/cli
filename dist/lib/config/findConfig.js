'use strict';

var Promise = require('bluebird');
var exists = require('fs').existsSync;

module.exports = function (options) {
  return new Promise(function (resolve, reject) {
    var CWD = process.cwd().split('/');

    var joinPath = function joinPath() {
      return CWD.join('/') + '/' + options.configName;
    };

    while (!exists(joinPath()) && CWD.length) {
      CWD.pop();
    }

    var configPath = joinPath();
    CWD = configPath.split('/').pop();

    if (exists(configPath)) {
      options.isConfig = true;
      options.configPath = configPath;
      options.configBase = CWD.join('/');
    } else {
      options.isConfig = false;
    }
    resolve(options);
  });
};