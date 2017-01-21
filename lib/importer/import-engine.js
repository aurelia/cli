"use strict";

const fs = require('../file-system'),
      UI = require('../ui').UI,
      CLIOptions = require('../cli-options').CLIOptions,
      Container = require('aurelia-dependency-injection').Container,
      StrategyLoader = require('./strategy-loader'),
      Tutorial = require('./services/tutorial'),
      MetadataService = require('./services/metadata-service'),
      ResourceInclusion = require('./services/resource-inclusion'),
      Registry = require('./services/registry'),
      logger = require('aurelia-logging').getLogger('Importer'),
      Package = require('./package'),
      Project = require('../project').Project,
      PackageImporter = require('./package-importer');

module.exports = class {

  static inject() { return [CLIOptions, Container, Project, UI]; }

  constructor(cliOptions, container, project, ui) {
    this.cliOptions = cliOptions;
    this.container = container;
    this.project = project;
    this.ui = ui;
  }

  import(packages) {
    var index = 0;
    var that = this;

    function _importPackage () {
      if (index == packages.length) {
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

