module.exports = function(aurelia) {
  aurelia.bundle({
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
};
