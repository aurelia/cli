import * as logger from '../lib/logger';
import {installTemplate} from '../lib/installer';
var cli = process.AURELIA;

// New
//
// Executable command for creating and downloading new Aurelia projects.
export function action(cmd, options) {
  var app = '';
  switch(cmd.toLowerCase()) {
    case 'navigation':
      app = 'skeleton-navigation';
      break;
    case 'plugin':
      app = 'skeleton-plugin';
      break;
  }

  if(app === '') {
    logger.error('Unknown template, please type aurelia new --help to get information on available types');
    return;
  }

  return installTemplate(app)
    .then(function(response) {
      logger.log(response);
      return response;
    })
    .catch(function(err) {
      logger.error(err);
    });
}
