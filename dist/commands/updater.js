'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _libLogger = require('../lib/logger');

var logger = _interopRequireWildcard(_libLogger);

var _libUpdater = require('../lib/updater');

var updater = _interopRequireWildcard(_libUpdater);

var _decorators = require('../decorators');

var UpdateCommand = (function () {
  function UpdateCommand(config, logger) {
    _classCallCheck(this, _UpdateCommand);

    this.config = config;
    this.logger = logger;
  }

  _createClass(UpdateCommand, [{
    key: 'action',
    value: function action(opts) {
      logger.log('Updating Aurelia...');
      logger.log('-------------------------');
      updater.update(opts);
    }
  }]);

  var _UpdateCommand = UpdateCommand;
  UpdateCommand = (0, _decorators.option)('-n --nuclear', "Go nuclear")(UpdateCommand) || UpdateCommand;
  UpdateCommand = (0, _decorators.description)('Update Aurelia')(UpdateCommand) || UpdateCommand;
  UpdateCommand = (0, _decorators.alias)('u')(UpdateCommand) || UpdateCommand;
  UpdateCommand = (0, _decorators.command)('update')(UpdateCommand) || UpdateCommand;
  return UpdateCommand;
})();

exports['default'] = UpdateCommand;
module.exports = exports['default'];