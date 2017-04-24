'use strict';

const logger = require('aurelia-logging').getLogger('Metadata');

let MetadataStrategy = class {

  static inject() { return ['package']; }

  constructor(pkg) {
    this.package = pkg;
  }

  applies() {
    if (!this.hasMetadata(this.package.packageJSON)) {
      logger.debug(`There is no "aurelia"."import" section in the package.json file of the plugin (looked in "${this.package.packageJSONPath}")`);
      return false;
    }

    return true;
  }

  execute() {
    let metadata = this.getMetadata(this.package.packageJSON);

    return metadata;
  }

  getMetadata(packageJSON) {
    return packageJSON.aurelia.import;
  }

  hasMetadata(packageJSON) {
    return packageJSON.aurelia !== undefined &&
           packageJSON.aurelia.import !== undefined &&
           typeof packageJSON.aurelia.import === 'object';
  }

  get name() {
    return 'Metadata Strategy';
  }
};

module.exports = MetadataStrategy;
