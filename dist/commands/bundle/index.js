'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _libBundler = require('../../lib/bundler');

var _libBundler2 = _interopRequireDefault(_libBundler);

var BundleCommand = function BundleCommand(program, config, logger) {
  var _this = this;

  _classCallCheck(this, BundleCommand);

  this.program = program;
  this.logger = logger;
  this.commandId = 'bundle';
  this.globalConfig = config;
  this.commandConfig = {};

  program.command('bundle').alias('b').description('Create a new bundle based on the configuration in Aureliafile.js').option('-a --add <path>', 'Add system.js path to files or file to bundle').option('-r --remove <remove_path>', 'Remove file path or file from bundle').option('-l, --list', 'List paths and files included in bundle').action(function (options) {
    (0, _libBundler2['default'])(_this.commandConfig);
  });
};

exports['default'] = BundleCommand;
module.exports = exports['default'];