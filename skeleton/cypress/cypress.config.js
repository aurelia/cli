const CLIOptions =  require( 'aurelia-cli').CLIOptions;
const aureliaConfig = require('./aurelia_project/aurelia.json');
const PORT = CLIOptions.getFlagValue('port') || aureliaConfig.platform.port;
const HOST = CLIOptions.getFlagValue('host') || aureliaConfig.platform.host;

module.exports = {
  config: {
    baseUrl: `http://${HOST}:${PORT}`,
    fixturesFolder: 'test/e2e/fixtures',
    integrationFolder: 'test/e2e/integration',
    pluginsFile: 'test/e2e/plugins/index.js',
    screenshotsFolder: 'test/e2e/screenshots',
    supportFile: 'test/e2e/support/index.js',
    videosFolder: 'test/e2e/videos'
  }
};
