'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

exports.init = init;

var _mkdirpPromise = require('../mkdirp-promise');

var _installer = require('../installer');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

/**
 * init
 * Create a directory at cwd/.aurelia, for creating plugins & storing templates
 * @param  {Object} config  Config passed from commands/init
 * @param  {Object} options Command Arguments
 * @return {Promise}        Resolved when all directories are made
 */

function init(options, config) {

  var aureliaDir = config.env.cwd + _path2['default'].sep + '.aurelia';

  console.log('aureliaDir: ' + aureliaDir);
  return;

  if (!options.env) {
    return _bluebird2['default'].resolve(cli.store.init({ config: config }));
  }

  var dirs = [aureliaDir('plugins'), aureliaDir('templates')];

  return (0, _installer.installTemplate)('skeleton-navigation').then(function () {
    return (0, _mkdirpPromise.mkdirp)(dirs).then(function () {

      config.env = config.env || {};
      config.env.plugins = dirs[0];
      config.env.templates = dirs[1];
      config.isInstalled = true;

      cli.store.init({ config: config });
      cli.store.save({ config: config });
      return;
    });
  });
}