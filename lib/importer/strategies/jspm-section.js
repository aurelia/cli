'use strict';

const logger = require('aurelia-logging').getLogger('JSPM');
const path = require('path');

let JSPMSectionStrategy = class {

  static inject() { return ['package']; }

  constructor(pkg) {
    this.package = pkg;
  }

  applies() {
    if (!this.hasJSPMConfig(this.package.packageJSON)) {
      logger.debug(`There is no "jspm" section in the package.json file of the plugin (looked in '${this.package.packageJSONPath}')`);
      return false;
    }

    return true;
  }

  execute() {
    let jspm = this.package.packageJSON.jspm;
    let main = jspm.main || this.package.packageJSON.main;
    let directories = jspm.directories;
    let distFolder = '';

    if (directories) {
      distFolder = directories.dist || directories.lib;
    }

    this.package.path = path.posix.join('../node_modules/', this.package.name, distFolder);
    this.package.main = main;

    if (jspm.shim && jspm.shim[main]) {
      let shim = jspm.shim[main];
      this.package.deps = shim.deps;
      this.package.exports = shim.exports;
    }

    return this.package.detectResources()
    .then(() => {
      return {
        dependencies: [this.package.getConfiguration()]
      };
    });
  }

  hasJSPMConfig(packageJSON) {
    return packageJSON.jspm;
  }

  get name() {
    return 'JSPM Section Strategy';
  }
};

module.exports = JSPMSectionStrategy;
