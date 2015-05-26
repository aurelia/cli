import {mkdirp} from '../mkdirp-promise';
import {installTemplate} from '../installer';
import Promise from 'bluebird';
import path from  'path';

/**
 * init
 * Create a directory at cwd/.aurelia, for creating plugins & storing templates
 * @param  {Object} config  Config passed from commands/init
 * @param  {Object} options Command Arguments
 * @return {Promise}        Resolved when all directories are made
 */

export function init(options, answers) {

  var store = options.store;
  var aureliaDir = path.join.bind(path, process.cwd() +  path.sep + '.aurelia');

  var dirs = [
    aureliaDir('plugins'),
    aureliaDir('templates')
  ];
  return store.init()
    .then(function(response){
      if (!options.env.modulePath) {
        return {msg: 'Local moduleFile not found, Please run $ aurelia new'};
      }
      if (!response.exists || answers.overwrite){
        return store.create();
      }
      return response;
    });

  // if (options.create)
  //   return mkdirp(dirs)
  //     .then(function(){
  //       if (store) {
  //         return store.init({config:config});
  //       }
  //       return {msg:'Folders created in .aurelia/'};
  //     });
}
