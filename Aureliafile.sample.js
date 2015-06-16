  var aurelia = require('aurelia-cli');

  // var awesome = require('aurelia-awesome');
  // aurelia.command(awesome); // register command plug in without configuration
  // aurelia.command(awesomeCommand, {}); //register command plugin with cnfiguration

  aurelia.command('bundle', {
    js: {
      "dist/app-build": {
        modules: [
          '*',
          'aurelia-animator-css',
          'aurelia-bootstrapper',
          'aurelia-router',
          'aurelia-http-client'
        ],
        options: {
          inject: true
        }
      }
   },
    template: {
      "dist/app-build": {
        pattern: ['dist/**/*.html', '!dist/about/*.html'],
        options: {
          inject: true
        }
      }
    }
  });

