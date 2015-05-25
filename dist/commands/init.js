'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _libInit = require('../lib/init');

var InitCommand = function InitCommand(program, config, logger) {
  var _this = this;

  _classCallCheck(this, InitCommand);

  this.program = program;
  this.logger = logger;
  this.commandId = 'init';
  this.globalConfig = config;

  program.command('init').option('-e, --env', 'Initialize an aurelia project environment').description('Initialize a new Aurelia Project and creates an Aureliafile').action(function (opt) {
    (0, _libInit.init)(opt, _this.globalConfig);
  }).on('--help', function () {
    example('init', {
      env: {
        flags: '--env  -e',
        info: 'Create a new .aurelia project directory.',
        required: false
      }
    });
  });
};

exports['default'] = InitCommand;
module.exports = exports['default'];