import { BasePackageManager } from './base-package-manager';

export class Yarn extends BasePackageManager {
  constructor() {
    super('yarn');
  }

  install(packages: string[] = [], workingDirectory = process.cwd()) {
    return super.install(packages, workingDirectory, !packages.length ? 'install' : 'add');
  }
};
