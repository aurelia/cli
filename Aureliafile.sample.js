  var aurelia = require('hacker');

  // var awesome = require('aurelia-awesome');
  // aurelia.command(awesome); // register command plug in without configuration
  // aurelia.command(awesomeCommand, {}); //register command plugin with cnfiguration

  
  // buit in command configuration
  aurelia.command('bundle', {
    js: {
      app: {
        modules: [
          'aurelia-skeleton-navigation/*',
        ],
        options: {
          inject: true
        }
      },
      'aurelia-bundle': {
        modules: [
          'aurelia-bootstrapper',
          'aurelia-router',
          'aurelia-http-client'
        ],
        options: {
          inject: false
        }
      }
    },
    template: {
      app: {
        pattern: 'dist/*.html',
        inject: true,
      }
    }
  });
