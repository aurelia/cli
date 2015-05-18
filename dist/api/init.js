'use strict';

var cli = process.AURELIA;
var mkdirp = cli['import']('lib/promise-mkdirp');
var Promise = require('bluebird');
var join = require('path').join;

var aureliaDir = '.aurelia';

module.exports = function (config, options) {
  if (options.env) {
    var dirs = [join(cli.env.cwd, aureliaDir, 'plugins'), join(cli.env.cwd, aureliaDir, 'templates')];
    return mkdirp(dirs).then(function () {
      config.env = config.env || {};
      config.env.plugins = dirs[0];
      config.env.templates = dirs[1];
      return cli.store.init({ config: config });
    });
  } else {
    return Promise.resolve(cli.store.init(config));
  }
};