var stream    = require('vinyl-fs')
   ,exists    = require('fs').existsSync
   ,bluebird  = require('bluebird')
   ,path      = require('path')
   ,configure = require('./env.config')
   ;

var cli       = process.AURELIA
   ,logger    = cli.import('lib/logger')
   ,ask       = cli.import('lib/ask')
   ,spawn     = cli.import('lib/spawn-promise')
   ,mkdirp    = cli.import('lib/promise-mkdirp')
   ;

// CREATE
//
// Executable Command that Creates a new project environment.
//
function Create(){
  var opts = {};
  logger.log('[%s] [%s]','Create'.blue, 'Project Environment'.cyan);
  opts.name   = this.parent.args[0] ? this.parent.args[0] : null;
  opts.env    = this.parent.env   || false;
  opts.level  = this.parent.level || false;

  configure(opts)
    .then(cloneTemplate)
    .then(copyEnvironment)
    .then(function(){
      logger.ok('Project environment created');
    })
    .catch(function(err){
      logger.err('Issue Creating project environment')
      logger.err(err);
    });
}

function cloneTemplate(config){
  var options = {
    command: 'git',
    args   : ['clone', 'http://github.com/aurelia/skeleton-navigation', config.name]
  };

  return spawn(options).then(

    function(){
      logger.ok('Template Downloaded!');
      return config;
    }
  );
}

function copyEnvironment(config) {
  var dirs = [
     config.paths.templates
    ,config.paths.plugins
  ];
  return mkdirp(dirs)
    .then(function(){
      logger.ok('project created at %s', config.paths.root.blue);
      return config;
    });
}


module.exports = Create;
