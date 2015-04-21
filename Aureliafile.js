module.exports = function(aurelia) {
  aurelia.config({
    "paths": {
      "*": "dist/*.js",
      "github:*": "jspm_packages/github/*.js",
      "npm:*": "jspm_packages/npm/*.js",
      "aurelia-skeleton-navigation/*": "lib/*.js"
    },
    "baseURL": 'file:C:/Users/Shuhel/Workspace/aurelia/skeleton-navigation/'
  });

  aurelia.bundle({
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
  });
}
