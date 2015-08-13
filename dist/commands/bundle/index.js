'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var _libBundler = require('../../lib/bundler');

var _libBundler2 = _interopRequireDefault(_libBundler);

var _decorators = require('../../decorators');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var BundleCommand = (function () {
  function BundleCommand(config, logger) {
    _classCallCheck(this, _BundleCommand);

    this.config = config;
    this.logger = logger;
  }

  var _BundleCommand = BundleCommand;

  _createClass(_BundleCommand, [{
    key: 'action',
    value: function action(opt) {
      this.logger.info('Creating bundle ...');

      var otheropts = {
        force: opt.force || false };

      var options = _lodash2['default'].defaults(this.commandConfig, otheropts);

      (0, _libBundler2['default'])(options);
    }
  }]);

  BundleCommand = (0, _decorators.option)('-f, --force', 'Overwrite previous bundle output file.')(BundleCommand) || BundleCommand;
  BundleCommand = (0, _decorators.description)('Create a new bundle based on the configuration in Aureliafile.js')(BundleCommand) || BundleCommand;
  BundleCommand = (0, _decorators.alias)('b')(BundleCommand) || BundleCommand;
  BundleCommand = (0, _decorators.command)('bundle')(BundleCommand) || BundleCommand;
  return BundleCommand;
})();

exports['default'] = BundleCommand;
module.exports = exports['default'];