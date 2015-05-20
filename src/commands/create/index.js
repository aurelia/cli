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
  var creator = cli.import('lib/create');
  logger.log('[%s] [%s]','Create'.blue, 'Project Environment'.cyan);
  opts.name   = this.parent.args[0] ? this.parent.args[0] : null;
  opts.env    = this.parent.env   || false;
  opts.level  = this.parent.level || false;

  configure(opts)
    .then(creator.create)
    .then(function(){
      logger.ok('Project environment created');
    })
    .catch(function(err){
      logger.err('Issue Creating project environment');
      logger.err(err);
    });
}
module.exports = Create;
