'use strict';

const Project = require('../project').Project;
const logger = require('aurelia-logging').getLogger('Package-installer');

let PackageInstaller = class {
  static inject() { return [Project]; }

  constructor(project) {
    this.project = project;
  }

  install(packages) {
    let aureliaJSON = this.project.model;
    let packageManager = aureliaJSON.packageManager || 'npm';
    let options = {};
    let Ctor;

    logger.info(`Using '${packageManager}' to install the package(s). You can change this by setting the 'packageManager' property in the aurelia.json file to 'npm' or 'yarn'.`);

    try {
      Ctor = require(`../package-managers/${packageManager}`).default;
    } catch (e) {
      logger.error(`Could not load the ${packageManager} package installer. Falling back to NPM`, e);

      packageManager = 'npm';
      Ctor = require(`../package-managers/${packageManager}`).default;
    }

    let installer = new Ctor();

    if (packageManager === 'npm') {
      options = {
        progress: false,
        save: true
      };
    }

    logger.info('*********** INSTALLING PACKAGES ***********');

    return installer.install(packages.map(x => x.argument), options);
  }
};

module.exports = PackageInstaller;
