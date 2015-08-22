'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _aureliaBundler = require('aurelia-bundler');

var _aureliaBundler2 = _interopRequireDefault(_aureliaBundler);

var _decorators = require('../../decorators');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var BundleCommand = (function () {
  function BundleCommand(config, logger) {
    _classCallCheck(this, _BundleCommand);

    this.config = config;
    this.logger = logger;
  }

  _createClass(BundleCommand, [{
    key: 'action',
    value: function action(opt) {
      this.logger.info('Creating bundle ...');

      var otheropts = {
        force: opt.force || false
      };

      var options = _lodash2['default'].defaults(this.commandConfig, otheropts);

      (0, _aureliaBundler2['default'])(options);
    }
  }]);

  var _BundleCommand = BundleCommand;
  BundleCommand = (0, _decorators.option)('-f, --force', 'Overwrite previous bundle output file.')(BundleCommand) || BundleCommand;
  BundleCommand = (0, _decorators.description)('Create a new bundle based on the configuration in Aureliafile.js')(BundleCommand) || BundleCommand;
  BundleCommand = (0, _decorators.alias)('b')(BundleCommand) || BundleCommand;
  BundleCommand = (0, _decorators.command)('bundle')(BundleCommand) || BundleCommand;
  return BundleCommand;
})();

exports['default'] = BundleCommand;
module.exports = exports['default'];