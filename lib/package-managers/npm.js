const BasePackageManager = require('./base-package-manager').default;

exports.NPM = class extends BasePackageManager {
  constructor() {
    super('npm');
  }
};

exports.default = exports.NPM;
