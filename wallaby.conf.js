module.exports = function() {
  return {
    files: [
      'lib/**/*.js',
      'package.json',
      {pattern: 'spec/mocks/**/*', load: false},
      {pattern: 'spec/helpers/polyfills.js', load: false}
    ],

    tests: [
      'spec/**/*[Ss]pec.js'
    ],

    env: {
      type: 'node'
    },

    bootstrap: function(wallaby) {
      require('aurelia-polyfills');
    },

    testFramework: 'jasmine'
  };
};
