const Configuration = require('../../lib/configuration').Configuration;
const CLIOptions = require('../../lib/cli-options').CLIOptions;
const ProjectMock = require('./project-mock');
const LoaderPlugin = require('../../lib/build/loader-plugin').LoaderPlugin;

module.exports = class Bundler {
  constructor() {
    this.itemIncludedInBuild = jasmine.createSpy('itemIncludedInBuild');
    this.interpretBuildOptions = jasmine.createSpy('interpretBuildOptions');
    this.configureDependency = jasmine.createSpy('configureDependency');
    this.addFile = jasmine.createSpy('addFile');
    this.configTargetBundle = {
      addAlias: jasmine.createSpy('addAlias')
    };

    CLIOptions.instance = new CLIOptions();
    this.buildOptions  = new Configuration({}, {});
    this.project = new ProjectMock();
    this.loaderOptions = {
      type: 'require',
      plugins: [new LoaderPlugin('require', {
        name: 'text',
        extensions: ['.html', '.css']
      })]
    };
    this.environment = 'dev';
  }
};
