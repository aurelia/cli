'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libLogger = require('../lib/logger');

var logger = _interopRequireWildcard(_libLogger);

var _envConfig = require('./env.config');

var _libCreate = require('../lib/create');

var cli = process.AURELIA;

function Create() {
  var opts = {};
  logger.log('[%s] [%s]', 'Create'.blue, 'Project Environment'.cyan);
  opts.name = this.parent.args[0] ? this.parent.args[0] : null;
  opts.env = this.parent.env || false;
  opts.level = this.parent.level || false;

  (0, _envConfig.configure)(opts).then(_libCreate.create).then(function () {
    logger.ok('Project environment created');
  })['catch'](function (err) {
    logger.err('Issue Creating project environment');
    logger.err(err);
  });
}
module.exports = Create;