'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libLogger = require('../lib/logger');

var logger = _interopRequireWildcard(_libLogger);

var _libInit = require('../lib/init');

var cli = process.AURELIA;

function Init() {
  var options = {};
  options.env = cli.env.argv.env;

  logger.ok('initializing');
  var config = cli.env.isConfig ? cli.aurelia._config : { env: {} };

  (0, _libInit.init)(config, options);
}
module.exports = Init;