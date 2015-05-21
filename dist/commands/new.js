'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.action = action;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libLogger = require('../lib/logger');

var logger = _interopRequireWildcard(_libLogger);

var _libInstaller = require('../lib/installer');

var cli = process.AURELIA;

function action(cmd, options) {
  var app = '';
  switch (cmd.toLowerCase()) {
    case 'navigation':
      app = 'skeleton-navigation';
      break;
    case 'plugin':
      app = 'skeleton-plugin';
      break;
  }

  if (app === '') {
    logger.error('Unknown template, please type aurelia new --help to get information on available types');
    return;
  }

  return (0, _libInstaller.installTemplate)(app).then(function (response) {
    logger.log(response);
    return response;
  })['catch'](function (err) {
    logger.error(err);
  });
}