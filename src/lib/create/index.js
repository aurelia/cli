import * as logger from '../logger';
import {mkdirp} from '../mkdirp-promise';
import {installTemplate} from '../installer';

var cli       = process.AURELIA;

export function create(config) {

  return copyEnvironment(config)
    .then(function(){
      console.log(config.paths.project);
      process.chdir(config.paths.project);
      return installTemplate('skeleton-navigation');
    });
};

function copyEnvironment(config) {
  var dirs = [
     config.paths.templates
    ,config.paths.project
    ,config.paths.plugins
  ];
  return mkdirp(dirs)
    .then(function(){
      logger.ok('project created at %s', config.paths.root.blue);
      return config;
    });
}
