const path = require('path');
const fs = require('../file-system');
const logger = require('aurelia-logging').getLogger('Package-installer');

exports.PackageInstaller = class {
  constructor(project) {
    this.project = project;
  }

  determinePackageManager() {
    if (this._packageManager) return this._packageManager;

    let packageManager = this.project.packageManager;

    if (!packageManager && fs.existsSync(path.resolve(process.cwd(), './yarn.lock'))) {
      // Have to make best guess on yarn.
      // If user is using yarn, then we use npm to install package,
      // it will highly likely end in error.
      packageManager = 'yarn';
    }

    if (!packageManager) {
      packageManager = 'npm';
    }

    this._packageManager = packageManager;
    return packageManager;
  }

  install(packages) {
    let packageManager = this.determinePackageManager();
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

    logger.info(`[${packageManager}] installing ${packages}. It would take a while.`);

    return installer.install(packages);
  }
};
