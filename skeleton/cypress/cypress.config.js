const CLIOptions =  require( 'aurelia-cli').CLIOptions;
const aureliaConfig = require('./aurelia_project/aurelia.json');
const PORT = CLIOptions.getFlagValue('port') || aureliaConfig.platform.port;
const HOST = CLIOptions.getFlagValue('host') || aureliaConfig.platform.host;

module.exports = {
  config: {
    baseUrl: `http://${HOST}:${PORT}`
  }
};
