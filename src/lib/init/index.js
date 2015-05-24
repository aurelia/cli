import {mkdirp} from '../mkdirp-promise';
import {installTemplate} from '../installer';

var Promise    = require('bluebird')
  , join       = require('path').join
  , cli        = process.AURELIA
  , aureliaDir = cli.cwd.bind(cli.cwd, '.aurelia')
;

/**
 * init
 *
 * > Create a directory at cwd/.aurelia, for creating plugins & storing templates
 *
 * @param  {Object} config  Config passed from commands/init
 *
 * @param  {Object} options Command Arguments
 * @return {Promise}        Resolved when all directories are made
 */
export function init(config, options) {

  if (!options.env)
    return Promise.resolve(cli.store.init({config:config}));

  var dirs   = [
    aureliaDir('plugins'),
    aureliaDir('templates')
  ];

  return mkdirp(dirs)
    .then(function(){

      config.env = config.env || {};
      config.env.plugins   = dirs[0];
      config.env.templates = dirs[1];
      config.isInstalled = true;

      cli.store.init({config:config});
      cli.store.save({config:config});
      return ;

    });
}
