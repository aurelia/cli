var cli       = process.AURELIA
  , logger = cli.import('lib/logger')
  ;

// New
//
// Executable command for creating and downloading new Aurelia projects.
function New(cmd, options){
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

  cli.api.installer.installTemplate(app)
    .then(function(response) {
      logger.log(response);
    })
    .catch(function(err) {
      logger.error(err);
    });
}

module.exports = New;
