'use strict';

const ImportEngine = require('../../importer/import-engine');
const ArgumentParser = require('../install/package-argument-parser');
const Project = require('../../project').Project;

module.exports = class {

  static inject() { return [ImportEngine, ArgumentParser, Project]; }

  constructor(engine, argumentParser, project) {
    this.engine = engine;
    this.argumentParser = argumentParser;
    this.project = project;
  }

  execute(args) {
    if (this.project.model.bundler && this.project.model.bundler.id !== 'cli') {
      throw new Error('This command is only available for the Aurelia CLI Bundler');
    }

    let packages = this.argumentParser.parse(args);

    if (packages.length === 0) {
      throw new Error('Expected atleast one package (au import <package>)');
    }

    return this.engine
      .import(packages)
      .catch(e => { console.log(e); });
  }
};
