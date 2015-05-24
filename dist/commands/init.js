'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.action = action;
exports.help = help;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libLogger = require('../lib/logger');

var logger = _interopRequireWildcard(_libLogger);

var _libInit = require('../lib/init');

var _libUtils = require('../lib/utils');

var cli = process.AURELIA;

function action(cmd, options) {
  var opts = {
    env: cli.argv.env
  };

  logger.ok('initializing');

  var config = cli.env.isValid ? cli.env.aurelia.configuration : false;

  return (0, _libInit.init)(config, opts);
}

function help() {
  (0, _libUtils.example)('init', {
    env: {
      flags: '--env  -e',
      info: 'Create a new .aurelia project directory.',
      required: false
    }
  });
}