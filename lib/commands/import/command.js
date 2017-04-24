'use strict';

const ImportEngine = require('../../importer/import-engine');
const ArgumentParser = require('../install/package-argument-parser');

module.exports = class {

  static inject() { return [ImportEngine, ArgumentParser]; }

  constructor(engine, argumentParser) {
    this.engine = engine;
    this.argumentParser = argumentParser;
  }

  execute(args) {
    let packages = this.argumentParser.parse(args);

    if (packages.length === 0) {
      throw new Error('Expected atleast one package (au import <package>)');
    }

    return this.engine
      .import(packages)
      .catch(e => { console.log(e); });
  }
};
