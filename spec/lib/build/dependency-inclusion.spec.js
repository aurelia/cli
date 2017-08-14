'use strict';

const BundlerMock = require('../../mocks/bundler');
const DependencyInclusion = require('../../../lib/build/dependency-inclusion').DependencyInclusion;
const DependencyDescription = require('../../../lib/build/dependency-description').DependencyDescription;
const mockfs = require('mock-fs');

describe('the DependencyInclusion module', () => {
  let bundler;

  beforeEach(() => {
    bundler = new BundlerMock();
  });

  afterEach(() => {
    mockfs.restore();
  });

  it('adds a dependency file to the bundle when there is a main file', () => {
    let bundle = {
      bundler: bundler
    };

    let description = new DependencyDescription();
    description.loaderConfig = {
      path: '../node_modules/my-package',
      name: 'my-package',
      main: 'index.js'
    };
    // eslint-disable-next-line no-unused-vars
    let sut = new DependencyInclusion(bundle, description);

    expect(bundler.addFile).toHaveBeenCalled();
  });

  it('adds a dependency file to the bundle when the path is a file', () => {
    mockfs({
      '../node_modules': {
        'my-package': {
          'index.js': 'some-content'
        }
      }
    });

    let bundle = {
      bundler: bundler
    };

    let description = new DependencyDescription();
    description.loaderConfig = {
      path: '../node_modules/my-package/index.js',
      name: 'my-package'
    };

    // eslint-disable-next-line no-unused-vars
    let sut = new DependencyInclusion(bundle, description);

    expect(bundler.addFile).toHaveBeenCalled();
  });

  it('does not add dependency file to the bundle when main is set to false', () => {
    mockfs();

    let bundle = {
      bundler: bundler
    };

    let description = new DependencyDescription();
    description.loaderConfig = {
      path: '../node_modules/my-package',
      name: 'my-package',
      main: false
    };

    // eslint-disable-next-line no-unused-vars
    let sut = new DependencyInclusion(bundle, description);

    expect(bundler.addFile).not.toHaveBeenCalled();
  });

  it('adds dependency file to the bundle when main is set to something other than false', () => {
    mockfs();

    let bundle = {
      bundler: bundler
    };

    let description = new DependencyDescription();
    description.loaderConfig = {
      path: '../node_modules/my-package',
      name: 'my-package',
      main: 'my-main-file.js'
    };

    // eslint-disable-next-line no-unused-vars
    let sut = new DependencyInclusion(bundle, description);

    expect(bundler.addFile).toHaveBeenCalled();
  });
});
