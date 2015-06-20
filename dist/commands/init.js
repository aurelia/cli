'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _libInit = require('../lib/init');

var _decorators = require('../decorators');

var InitCommand = (function () {
  function InitCommand(config, logger) {
    _classCallCheck(this, _InitCommand);

    this.config = config;
  }

  var _InitCommand = InitCommand;

  _createClass(_InitCommand, [{
    key: 'action',
    value: function action(opt) {
      (0, _libInit.init)(opt, this.config);
    }
  }]);

  InitCommand = (0, _decorators.description)('Initialize a new Aurelia Project and creates an Aureliafile')(InitCommand) || InitCommand;
  InitCommand = (0, _decorators.option)('-e, --env', 'Initialize an aurelia project environment')(InitCommand) || InitCommand;
  InitCommand = (0, _decorators.command)('init')(InitCommand) || InitCommand;
  return InitCommand;
})();

exports['default'] = InitCommand;
module.exports = exports['default'];