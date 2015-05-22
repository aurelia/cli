'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.action = action;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libLogger = require('../lib/logger');

var logger = _interopRequireWildcard(_libLogger);

var cli = process.AURELIA;

function action(cmd, opts) {
  logger.log('exec "%s" using %s mode', cmd, opts.name());
  logger.log('Not yet implemented...');
  logger.log('-----------------------------------');
  logger.log('  - Plugin management not yet implemented');
}