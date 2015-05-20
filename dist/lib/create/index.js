'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.create = create;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _logger = require('../logger');

var logger = _interopRequireWildcard(_logger);

var _mkdirpPromise = require('../mkdirp-promise');

var _installer = require('../installer');

var cli = process.AURELIA;

function create(config) {

  return copyEnvironment(config).then(function () {
    console.log(config.paths.project);
    process.chdir(config.paths.project);
    return (0, _installer.installTemplate)('skeleton-navigation');
  });
}

;

function copyEnvironment(config) {
  var dirs = [config.paths.templates, config.paths.project, config.paths.plugins];
  return (0, _mkdirpPromise.mkdirp)(dirs).then(function () {
    logger.ok('project created at %s', config.paths.root.blue);
    return config;
  });
}