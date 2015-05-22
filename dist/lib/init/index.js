'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.init = init;

var _mkdirpPromise = require('../mkdirp-promise');

var _installer = require('../installer');

var Promise = require('bluebird'),
    join = require('path').join,
    cli = process.AURELIA,
    aureliaDir = cli.cwd.bind(cli.cwd, '.aurelia');

function init(config, options) {

  if (!options.env) {
    return Promise.resolve(cli.store.init({ config: config }));
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