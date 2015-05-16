module.exports = function(aurelia) {
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
    template: {
      pattern: 'dist/*.html',
      outfile: 'bundle.html'
    }
  });
}

