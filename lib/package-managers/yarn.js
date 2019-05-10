const BasePackageManager = require('./base-package-manager').default;

exports.Yarn = class extends BasePackageManager {
  constructor() {
    super('yarn');
  }

  install(packages = [], workingDirectory = process.cwd()) {
    return super.install(packages, workingDirectory, !packages.length ? 'install' : 'add');
  }
};

exports.default = exports.Yarn;
