'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.init = init;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libLogger = require('./lib/logger');

var logger = _interopRequireWildcard(_libLogger);

var _libUtils = require('./lib/utils');

var _libExecCommand = require('./lib/exec-command');

var program = require('./lib/program');

var pjson = require('../package.json');
var cli = process.AURELIA;
var chalk = require('chalk');

function init(env) {

  if (env.argv.verbose) {
    logger.log('LIFTOFF SETTINGS:', env.liftoff);
    logger.log('CLI OPTIONS:', env.argv);
    logger.log('CWD:', env.cwd);

    logger.log('FOUND CONFIG AT:', env.configPath);
    logger.log('CONFIG NAME:', env.configName);
    logger.log('YOUR LOCAL MODULE IS LOCATED:', env.modulePath);
    logger.log('LOCAL PACKAGE.JSON:', env.modulePath);
    logger.log('CLI PACKAGE.JSON', require('../package'));
  }

  (0, _libExecCommand.command)('new', '[type]').description('create a new Aurelia project').prompt({
    type: 'list',
    name: 'template',
    message: 'Template?',
    when: function when() {
      return !env.args[1];
    },
    onLoad: true,
    choices: [{
      name: 'navigation',
      value: 'skeleton-navigation'
    }, {
      name: 'plugin',
      value: 'skeleton-plugin'
    }]
  }).help('new').execute('new').then(function () {});

  (0, _libExecCommand.command)('init').option('-e, --env', 'Initialize an aurelia project environment').description('Initialize a new Aurelia Project and creates an Aureliafile').help('init').execute('init').then(function () {});

  env['continue'] = !env.cmd;
  env.done(env);
}