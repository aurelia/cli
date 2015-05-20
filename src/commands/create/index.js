import * as logger from '../lib/logger';
import {configure} from './env.config';
import {create} from '../lib/create';
var cli = process.AURELIA;

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
    .then(create)
    .then(function(){
      logger.ok('Project environment created');
    })
    .catch(function(err){
      logger.err('Issue Creating project environment');
      logger.err(err);
    });
}
module.exports = Create;
