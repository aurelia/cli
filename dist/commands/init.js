'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _libInit = require('../lib/init');

var _decorators = require('../decorators');

var InitCommand = (function () {
  function InitCommand(config, logger) {
    _classCallCheck(this, _InitCommand);

    this.config = config;
  }

  _createClass(InitCommand, [{
    key: 'action',
    value: function action(opt) {
      (0, _libInit.init)(opt, this.config);
    }
  }]);

  var _InitCommand = InitCommand;
  InitCommand = (0, _decorators.description)('Initialize a new Aurelia Project and creates an Aureliafile')(InitCommand) || InitCommand;
  InitCommand = (0, _decorators.option)('-e, --env', 'Initialize an aurelia project environment')(InitCommand) || InitCommand;
  InitCommand = (0, _decorators.command)('init')(InitCommand) || InitCommand;
  return InitCommand;
})();

exports['default'] = InitCommand;
module.exports = exports['default'];