'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _libBundler = require('../../lib/bundler');

var _libBundler2 = _interopRequireDefault(_libBundler);

var _decorators = require('../../decorators');

var BundleCommand = (function () {
  function BundleCommand(config, logger) {
    _classCallCheck(this, _BundleCommand);

    this.config = config;
    this.logger = logger;
  }

  var _BundleCommand = BundleCommand;

  _createClass(_BundleCommand, [{
    key: 'action',
    value: function action(options) {
      this.logger.info('Creating bundle ...');
      (0, _libBundler2['default'])(this.commandConfig, options);
    }
  }]);

  BundleCommand = (0, _decorators.option)('-f, --force', 'Overwrite output file!')(BundleCommand) || BundleCommand;
  BundleCommand = (0, _decorators.option)('-l, --list', 'List paths and files included in bundle')(BundleCommand) || BundleCommand;
  BundleCommand = (0, _decorators.option)('-r --remove <remove_path>', 'Remove file path or file from bundle')(BundleCommand) || BundleCommand;
  BundleCommand = (0, _decorators.option)('-a --add <path>', 'Add system.js path to files or file to bundle')(BundleCommand) || BundleCommand;
  BundleCommand = (0, _decorators.description)('Create a new bundle based on the configuration in Aureliafile.js')(BundleCommand) || BundleCommand;
  BundleCommand = (0, _decorators.alias)('b')(BundleCommand) || BundleCommand;
  BundleCommand = (0, _decorators.command)('bundle')(BundleCommand) || BundleCommand;
  return BundleCommand;
})();

exports['default'] = BundleCommand;
module.exports = exports['default'];