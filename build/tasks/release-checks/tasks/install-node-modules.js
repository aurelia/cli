const Task = require('./task');
const Yarn = require('../../../../lib/package-managers/yarn').Yarn;
const LogManager = require('aurelia-logging');
const logger = LogManager.getLogger('install-node-modules');
const fs = require('fs');
const path = require('path');

module.exports = class InstallNodeModules extends Task {
  constructor() {
    super('Install node modules');
  }

  execute(context) {
    if (fs.existsSync(path.join(context.workingDirectory, 'node_modules'))) {
      logger.info('node_modules folder exists in the project directory, not installing node_modules again');
      return Promise.resolve();
    }

    logger.debug('installing packages in ' + context.workingDirectory);

    const yarn = new Yarn();
    return yarn.install([], context.workingDirectory);
  }
};
