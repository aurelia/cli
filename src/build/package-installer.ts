import * as path from 'node:path';
import * as fs from '../file-system';
import { BasePackageManager } from '../package-managers/base-package-manager';
import { getLogger } from 'aurelia-logging';
const logger = getLogger('Package-installer');


export class PackageInstaller {
  private project: AureliaJson.IProject;
  private _packageManager: string | undefined;

  constructor(project: AureliaJson.IProject) {
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

  async install(packages: string[]) {
    let packageManager = this.determinePackageManager();
    let Ctor: new () => BasePackageManager;

    logger.info(`Using '${packageManager}' to install the package(s). You can change this by setting the 'packageManager' property in the aurelia.json file to 'npm' or 'yarn'.`);

    try {
      Ctor = (await import(`../package-managers/${packageManager}`)).default;
    } catch (e) {
      logger.error(`Could not load the ${packageManager} package installer. Falling back to NPM`, e);

      packageManager = 'npm';
      Ctor = (await import(`../package-managers/${packageManager}`)).default;
    }

    const installer = new Ctor();

    logger.info(`[${packageManager}] installing ${packages}. It would take a while.`);

    return installer.install(packages);
  }
};
