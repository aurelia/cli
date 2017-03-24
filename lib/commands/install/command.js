'use strict';

const ImportCommand = require('../import/command');
const PackageInstaller = require('../../importer/package-installer');
const ArgumentParser = require('./package-argument-parser');
const logger = require('aurelia-logging').getLogger('Install');

module.exports = class {

  static inject() { return [PackageInstaller, ImportCommand, ArgumentParser]; }

  constructor(packageInstaller, importCommand, argumentParser) {
    this.packageInstaller = packageInstaller;
    this.importCommand = importCommand;
    this.argumentParser = argumentParser;
  }

  execute(args) {
    let packages = new ArgumentParser().parse(args);

    if (packages.length === 0) {
      throw new Error('Expected atleast one package (au import <package>)');
    }

    return this.packageInstaller
      .install(packages)
      .then(() => logger.info('The packages were successfully installed. Going to import them now.'))
      .then(() => this.importCommand.execute(args))
      .catch(e => console.log(e));
  }
};
