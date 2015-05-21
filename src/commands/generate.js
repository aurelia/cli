import * as logger from '../lib/logger';
import * as generator from '../lib/generator';

var cli     = process.AURELIA;

// Generate
//
// Executable Command for Generating new file type based on type specified
export function action(cmd, options) {
  if(typeof options.name === 'function' || options.name === '') {
    logger.err('You must provide a name for the new element');
    return;
  }

  if(cmd.toLowerCase() === generator.templateType.vm) {
    var template = options.template || 'default'
      , inject   = options.inject;

    generator.createViewModel(options.name, template, inject).then( function(response) {
      logger.log(response);

      if(options.view && options.view !== '') {
        generator.createView(options.name, template)
          .then(function(response) { logger.log(response); })
          .catch(function(response) { logger.log(response); });
      }
    }).catch(function(err) {
      logger.log(err);
    });
  } else if( cmd.toLowerCase() === generator.templateType.view ) {
    var template = options.template || 'default';

    generator.createView(options.name, template);
  }
}
