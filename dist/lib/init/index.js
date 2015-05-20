'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.init = init;

var _mkdirpPromise = require('../mkdirp-promise');

var Promise = require('bluebird');
var join = require('path').join;
var cli = process.AURELIA;

var aureliaDir = '.aurelia';

function init(config, options) {
  if (options.env) {
    var dirs = [join(cli.env.cwd, aureliaDir, 'plugins'), join(cli.env.cwd, aureliaDir, 'templates')];
    return (0, _mkdirpPromise.mkdirp)(dirs).then(function () {
      config.env = config.env || {};
      config.env.plugins = dirs[0];
      config.env.templates = dirs[1];
      return cli.store.init({ config: config });
    });
  } else {
    return Promise.resolve(cli.store.init(config));
  }
}

;