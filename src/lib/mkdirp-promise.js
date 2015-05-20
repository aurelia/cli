var fs      = require('fs')
   ,path    = require('path')
   ,Promise = require('bluebird')
   ,map     = require('lodash/collection/map')
   ,cli     = process.AURELIA
   ,mkdirp_module  = require('mkdirp')
   ;


var logger = cli.import('lib/logger');

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
