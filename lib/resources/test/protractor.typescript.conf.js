const aureliaConfig = require('../aurelia_project/aurelia.json');
const port = aureliaConfig.platform.port;

exports.config = {
  port: port,

  baseUrl: `http://localhost:${port}/`,

  specs: [
    '**/*.e2e.ts'
  ],

  exclude: [],

  framework: 'jasmine',

  allScriptsTimeout: 110000,

  jasmineNodeOpts: {
    showTiming: true,
    showColors: true,
    isVerbose: true,
    includeStackTrace: false,
    defaultTimeoutInterval: 400000
  },

  SELENIUM_PROMISE_MANAGER: false,

  directConnect: true,

  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      'args': [
        '--show-fps-counter',
        '--no-default-browser-check',
        '--no-first-run',
        '--disable-default-apps',
        '--disable-popup-blocking',
        '--disable-translate',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-device-discovery-notifications',
        /* enable these if you'd like to test using Chrome Headless
          '--no-gpu',
          '--headless'
        */
      ]
    }
  },

  onPrepare: function() {
    require('ts-node').register({ compilerOptions: { module: 'commonjs' }, disableWarnings: true, fast: true });
  },

  plugins: [{
    package: 'aurelia-protractor-plugin'
  }],
};