'use strict';

const fs = require('../file-system');
const UI = require('../ui').UI;
const CLIOptions = require('../cli-options').CLIOptions;
const Container = require('aurelia-dependency-injection').Container;
const MetadataService = require('./services/metadata-service');
const ResourceInclusion = require('./services/resource-inclusion');
const Registry = require('./services/registry');
const Package = require('./package');
const Project = require('../project').Project;
const PackageImporter = require('./package-importer');

module.exports = class {

  static inject() { return [CLIOptions, Container, Project, UI]; }

  constructor(cliOptions, container, project, ui) {
    this.cliOptions = cliOptions;
    this.container = container;
    this.project = project;
    this.ui = ui;
  }

  import(packages) {
    let index = 0;
    let that = this;

    function _importPackage() {
      if (index === packages.length) {
        return Promise.resolve();
      }

      return that.importPackage(packages[index++])
      .then(_importPackage);
    }

    return _importPackage();
  }

  importPackage(pkg) {
    let container = this.getContainer(pkg);
    let importer = container.get(PackageImporter);
    return importer.import();
  }

  getContainer(pkg) {
    // use a clean DI container for the entire import process
    let container = new Container();

    pkg = new Package(pkg);

    container.registerInstance('parameters', {
      action: 'install',
      bundle: this.cliOptions.getFlagValue('bundle', '-b') || this.project.getDefaultBundle().name
    });
    container.registerInstance(UI, this.ui);
    container.registerInstance('project', this.project);
    container.registerInstance('package', pkg);
    container.registerInstance('fs', fs);
    container.registerAlias(UI, 'ui');
    container.registerAlias(ResourceInclusion, 'resource-inclusion');
    container.registerAlias(MetadataService, 'metadata-service');
    container.registerAlias(Registry, 'registry');

    pkg.resourceInclusion = container.get('resource-inclusion');

    return container;
  }
};

