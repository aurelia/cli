'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _libBundler = require('../../lib/bundler');

var _libBundler2 = _interopRequireDefault(_libBundler);

var BundleCommand = (function () {
  function BundleCommand(program, config, logger) {
    _classCallCheck(this, BundleCommand);

    this.program = program;
    this.logger = logger;
    this.globalConfig = config;
    this.commandConfig = {};
  }

  _createClass(BundleCommand, [{
    key: 'action',
    value: function action() {
      (0, _libBundler2['default'])(this.commandConfig);
    }
  }], [{
    key: 'register',
    value: function register(command) {
      command('bundle').alias('b').description('Create a new bundle based on the configuration in Aureliafile.js').option('-a --add <path>', 'Add system.js path to files or file to bundle').option('-r --remove <remove_path>', 'Remove file path or file from bundle').option('-l, --list', 'List paths and files included in bundle');
    }
  }]);

  return BundleCommand;
})();

exports['default'] = BundleCommand;
module.exports = exports['default'];