'use strict';

const semver = require('semver');
const logger = require('aurelia-logging').getLogger('Registry');

let AureliaRegistryStrategy = class {

  static inject() { return ['package', 'registry']; }

  constructor(pkg, registry) {
    this.package = pkg;
    this.registry = registry;
  }

  applies() {
    let version = semver.clean(this.package.version);

    return this.registry.getPackageConfig(this.package, version)
    .then(config => {
      if (config) {
        this.config = config;
        return this.isUsableConfig(config);
      }

      logger.debug(`The registry does not contain a package configuration for ${this.package.name}`);
      return false;
    });
  }

  execute() {
    return this.config;
  }

  isUsableConfig(c) {
    let props = ['patches', 'dependencies', 'bundles', 'tasks', 'scripts'];
    return Object.keys(c).some(key => props.includes(key));
  }

  get name() {
    return 'Registry Strategy';
  }
};

module.exports = AureliaRegistryStrategy;
