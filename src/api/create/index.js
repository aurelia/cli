var exists    = require('fs').existsSync
   ,bluebird  = require('bluebird')
   ,path      = require('path')
   ;

var cli       = process.AURELIA
   ,logger    = cli.import('lib/logger')
   ,mkdirp    = cli.import('lib/promise-mkdirp')
   ,api       = cli.api
   ;


module.exports = function(config) {
  return copyEnvironment(config)
    .then(function(){
      console.log(config.paths.project);
      process.chdir(config.paths.project);
      return cli.api.installer.installTemplate('skeleton-navigation');
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
