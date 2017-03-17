'use strict';

const fs = require('../../file-system');
const Container = require('aurelia-dependency-injection').Container;
const logger = require('aurelia-logging').getLogger('Custom-importer');

let CustomImporterStrategy = class {

  static inject() { return [Container, 'package']; }

  constructor(container, pkg) {
    this.container = container;
    this.package = pkg;
  }

  applies() {
    let location = this.getStrategyLocation();

    return fs.exists(location)
    .then(available => {
      if (available) {
        let strategy = this.getStrategy();
        let result = strategy.applies();

        return result;
      }

      logger.debug(`The plugin does not have a custom importer module. Looked for "${location}"`);

      return false;
    });
  }

  execute() {
    let strategy = this.getStrategy();
    let result = strategy.execute();

    return result;
  }

  getStrategy() {
    let ctor = require(this.getStrategyLocation());
    return this.container.get(ctor);
  }

  getStrategyLocation() {
    let pjson = this.package.packageJSON;

    if (pjson.aurelia && (typeof pjson.aurelia.import === 'string')) {
      return fs.resolve(fs.join(this.package.rootPath, pjson.aurelia.import));
    }

    return fs.resolve(fs.join(this.package.rootPath, 'install', 'importer-callbacks.js'));
  }

  get name() {
    return 'Custom Importer Strategy';
  }
};

module.exports = CustomImporterStrategy;
