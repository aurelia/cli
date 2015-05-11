var fs      = require('fs')
   ,path    = require('path')
   ,Promise = require('bluebird')
   ,map     = require('lodash/collection/map')
   ,cli     = process.AURELIA
   ;


var logger = cli.import('lib/logger');
var mkdirs = cli.import('lib/utils').makeDirectories;

function mkdirp(dirs, initialDirs){
  if (Array.isArray(dirs)) {
    return Promise.all(
      map(dirs, function(dir) {
        return mkdirp(dir, dirs);
      })
    ).then(function(){
        return {message:'Finished creating directories'}
    })
  }
  return new Promise(function(resolve, reject){
    mkdirs(dirs, function(err) {
      err
        ? reject({message: 'Issue creating directories!', Error: err})
        : resolve({message:'Finished creating directories'});
    });
  });
}

module.exports = mkdirp;
