const CLIOptions = require('aurelia-cli').CLIOptions;
const aureliaConfig = require('./aurelia_project/aurelia.json');
const cliOptions = new CLIOptions();

Object.assign(cliOptions, {
  args: process.argv.slice(3)
});

const port = cliOptions.getFlagValue('port') || aureliaConfig.platform.port;
const host = cliOptions.getFlagValue('host') || aureliaConfig.platform.host || "localhost";
const headless = cliOptions.hasFlag('headless');

const config  = {
  port: port,
  host: host,
  baseUrl: `http://${host}:${port}/`,

  specs: [
// @if feat.babel
    '**/*.e2e.js'
// @endif
// @if feat.typescript
    '**/*.e2e.ts'
// @endif
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
        '--no-sandbox',
        '--disable-dev-shm-usage'
      ]
    }
  },

  onPrepare: function() {
// @if feat.babel
    process.env.BABEL_TARGET = 'node';
    process.env.IN_PROTRACTOR = 'true';
    require('@babel/register');
// @endif
// @if feat.typescript
    require('ts-node').register({ compilerOptions: { module: 'commonjs' }, disableWarnings: true, fast: true });
// @endif
  },

  plugins: [{
    package: 'aurelia-protractor-plugin'
  }],
};

if (headless) {
  config.capabilities.chromeOptions.args.push("--no-gpu");
  config.capabilities.chromeOptions.args.push("--headless");
}

exports.config = config;
