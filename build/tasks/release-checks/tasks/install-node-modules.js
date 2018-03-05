'use strict';
const Task = require('./task');
const Yarn = require('../../../../lib/package-managers/yarn').Yarn;
const LogManager = require('aurelia-logging');
const logger = LogManager.getLogger('install-node-modules');

module.exports = class InstallNodeModules extends Task {
  constructor() {
    super('Install node modules');
  }

  execute(context) {
    logger.debug('installing packages using yarn in ' + context.workingDirectory);

    let yarn = new Yarn();

    return yarn.install([], { cwd: context.workingDirectory })
    .then(() => {
      return [
        { message: 'installed the package in ' + context.workingDirectory }
      ];
    });
  }
};
