'use strict';

var isArg,
    exists = require('fs').existsSync;
var path = require('path');

module.exports = function command(cmd) {
  cmd = __dirname + path.sep + cmd;

  isArg = exists(cmd);

  if (!isArg) {
    cmd += '.js';
    isArg = exists(cmd);

    if (!isArg) {
      console.log('[%s] Command %s does not exist!', 'Error'.red, cmd.red);

      process.exit(1);
    }
  }

  return function () {
    return require(cmd).apply(this, arguments);
  };
};