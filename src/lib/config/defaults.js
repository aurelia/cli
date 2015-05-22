var extend = require('lodash/object/extend');


export function defaults(config, bundle) {
  var defaultConfig = {};
  defaultConfig.config = {
    "paths": {
      "*": "dist/*.js",
      "github:*": "jspm_packages/github/*.js",
      "npm:*": "jspm_packages/npm/*.js",
      "aurelia-skeleton-navigation/*": "lib/*.js"
    },
    "env":{},
    isInstalled: true
  };
  defaultConfig.bundle = {
    js: [{
      moduleExpression: 'aurelia-skeleton-navigation/*',
      fileName: 'nav-app-build.js',
      options: {
        inject: true
      }
    }, {
      moduleExpression: 'aurelia-bootstrapper',
      fileName: 'aurelia-framework-build.js',
      options: {
        inject: true
      }
    }],
    template: 'dist/*.html'
  };

  if (config) {
    extend(defaultConfig.config, config);
  }
  if (config) {
    extend(defaultConfig.bundle, bundle);
  }
  return defaultConfig;
}
