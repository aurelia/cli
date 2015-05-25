var fs      = require('fs')
   ,Promise = require('bluebird')
   ,map     = require('lodash/collection/map')
   ,cli     = process.AURELIA
   ,mkdirp_module  = require('mkdirp')
   ,logger  = require('./logger')
;


/**
 * mkdirp
 *
 * > Recursively make directories and resolve a Promise when finished
 *
 * @param  {String || Array} dirs  Either a path or and Array of paths to recursively create
 * @param  {String || Array} initialDirs The Original dirs after recursive call
 * @return {Promise}         resolve a Promise when finished
 */
export function mkdirp(dirs, initialDirs){
  if (Array.isArray(dirs)) {
    return Promise.all(
      map(dirs, function(dir) {
        return mkdirp(dir);
      })
    ).then(function(){
        return {message:'Finished creating directories'};
    });
  }
  return new Promise(function(resolve, reject){
    mkdirp_module(dirs);
    resolve({message:'Finished creating directories'});
  });
}
