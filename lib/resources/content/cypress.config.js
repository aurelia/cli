const aureliaConfig = require('./aurelia_project/aurelia.json');
const port = aureliaConfig.platform.port;

module.exports = {
  config: {
    baseUrl: `http://localhost:${port}`,
    fixturesFolder: 'test/e2e/fixtures',
    integrationFolder: 'test/e2e/integration',
    pluginsFile: 'test/e2e/plugins/index.js',
    screenshotsFolder: 'test/e2e/screenshots',
    supportFile: 'test/e2e/support/index.js',
    videosFolder: 'test/e2e/videos'
  }
};
