'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.action = action;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libLogger = require('../lib/logger');

var logger = _interopRequireWildcard(_libLogger);

var _libUpdater = require('../lib/updater');

var updater = _interopRequireWildcard(_libUpdater);

var cli = process.AURELIA;

function action(options) {
  logger.log(options);
  logger.log('Updating Aurelia...');
  logger.log('-----------------------------------');
  updater.update(options);
}