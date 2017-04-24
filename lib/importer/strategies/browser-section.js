'use strict';

const logger = require('aurelia-logging').getLogger('Browser');

let BrowserSectionStrategy = class {

  static inject() { return ['package']; }

  constructor(pkg) {
    this.package = pkg;
  }

  applies() {
    if (!this.hasBrowserSection(this.package.packageJSON)) {
      logger.debug(`There is no (usable) "browser" section in the package.json file of the plugin (looked in '${this.package.packageJSONPath}')`);
      return false;
    }

    return true;
  }

  execute() {
    let browser = this.package.packageJSON.browser;
    this.package.main = this.package.getModuleId(browser);

    return this.package.detectResources()
    .then(() => {
      return {
        dependencies: [this.package.getConfiguration()]
      };
    });
  }

  hasBrowserSection(packageJSON) {
    return packageJSON.browser && typeof packageJSON.browser === 'string';
  }

  get name() {
    return 'Browser Section Strategy';
  }
};

module.exports = BrowserSectionStrategy;
