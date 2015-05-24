'use strict';

var _ask = require('./ask');

var program = require('commander');
var Promise = require('bluebird');

program.Command.prototype.ask = _ask.ask;
program.Command.prototype.loadPrompts = [];
program.Command.prototype._prompts = [];

program.Command.prototype.onHelp = function (cb) {
  var self = this;
  this.on('--help', function () {
    cb.call(self);
  });
  return this;
};

program.Command.prototype.isCmd = function (name) {
  var result = false;
  this._cmds = this._cmds || {};

  if (this._cmds[name]) return true;

  this.commands.forEach((function (cmd) {
    this._cmds = cmd;
    if (cmd._name === name) {
      result = true;
      return;
    }
  }).bind(this));
  return result;
};

module.exports = program;