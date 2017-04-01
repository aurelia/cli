'use strict';

const Bundler = require('../../../lib/build/bundler').Bundler;
const PackageAnalyzer = require('../../mocks/package-analyzer');
const CLIOptionsMock = require('../../mocks/cli-options');

describe('the Bundler module', () => {
  let analyzer;
  let cliOptionsMock;

  beforeEach(() => {
    analyzer = new PackageAnalyzer();
    cliOptionsMock = new CLIOptionsMock();
    cliOptionsMock.attach();
  });

  it('uses paths.root from aurelia.json in the loaderConfig as baseUrl', () => {
    let project = {
      paths: {
        root: 'src'
      },
      build: { loader: {} }
    };
    let bundler = new Bundler(project, analyzer);
    expect(bundler.loaderConfig.baseUrl).toBe('src');
  });

  it('takes paths from aurelia.json and uses it in the loaderConfig', () => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };
    let bundler = new Bundler(project, analyzer);
    expect(bundler.loaderConfig.paths.root).toBe('src');
    expect(bundler.loaderConfig.paths.foo).toBe('bar');
  });

  it('ensures that paths in aurelia.json are relative from the root path', () => {
    let project = {
      paths: {
        root: 'src',
        foo: 'src/bar'
      },
      build: { loader: {} }
    };
    let bundler = new Bundler(project, analyzer);
    expect(bundler.loaderConfig.paths.foo).toBe('bar');
  });

  afterEach(() => {
    cliOptionsMock.detach();
  });
});
