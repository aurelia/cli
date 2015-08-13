'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var _decorators = require('../decorators');

var _libUnbundler = require('../lib/unbundler');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var InitCommand = (function () {
  function InitCommand(config, logger) {
    _classCallCheck(this, _InitCommand);

    this.config = config;
    this.logger = logger;
  }

  var _InitCommand = InitCommand;

  _createClass(_InitCommand, [{
    key: 'action',
    value: function action(opt) {
      var _this = this;

      var otheropts = {
        clearinvalids: opt.clearinvalids || false,
        removefiles: opt.removefiles || false
      };

      var options = _lodash2['default'].defaults(this.commandConfig, otheropts);

      this.logger.info('Un bundling ... ');

      (0, _libUnbundler.unbundle)(options).then(function () {
        _this.logger.info('Bundle configuration removed! ...');
      });
    }
  }]);

  InitCommand = (0, _decorators.description)('Unbundles based on bundle config in Aureliafile')(InitCommand) || InitCommand;
  InitCommand = (0, _decorators.option)('-r, --remove-files', 'Remove bundle files.')(InitCommand) || InitCommand;
  InitCommand = (0, _decorators.alias)('u')(InitCommand) || InitCommand;
  InitCommand = (0, _decorators.command)('unbundle')(InitCommand) || InitCommand;
  return InitCommand;
})();

exports['default'] = InitCommand;
module.exports = exports['default'];