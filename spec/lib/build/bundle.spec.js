'use strict';

const BundlerMock = require('../../mocks/bundler');
const Bundle = require('../../../lib/build/bundle').Bundle;
const CLIOptionsMock = require('../../mocks/cli-options');
const DependencyDescription = require('../../../lib/build/dependency-description').DependencyDescription;

describe('the Bundle module', () => {
  let sut;
  let cliOptionsMock;

  beforeEach(() => {
    cliOptionsMock = new CLIOptionsMock();
    cliOptionsMock.attach();

    let bundler = new BundlerMock();
    let config = {
      name: 'app-bundle.js'
    };
    sut = new Bundle(bundler, config);
  });

  afterEach(() => {
    cliOptionsMock.detach();
  });

  it('only prepends items that are included in the build', () => {
    let bundler = new BundlerMock();
    bundler.itemIncludedInBuild.and.callFake((item) => {
      if (item === 'firstitem.js') return true;

      return false;
    });

    let config = {
      name: 'app-bundle.js',
      prepend: [
        'firstitem.js',
        'seconditem.js'
      ]
    };
    sut = new Bundle(bundler, config);

    expect(sut.prepend.length).toBe(1);
    expect(sut.prepend[0]).toBe('firstitem.js');
  });

  it('only appends items that are included in the build', () => {
    let bundler = new BundlerMock();
    bundler.itemIncludedInBuild.and.callFake((item) => {
      if (item === 'firstitem.js') return true;

      return false;
    });

    let config = {
      name: 'app-bundle.js',
      append: [
        'firstitem.js',
        'seconditem.js'
      ]
    };
    sut = new Bundle(bundler, config);

    expect(sut.append.length).toBe(1);
    expect(sut.append[0]).toBe('firstitem.js');
  });

  it('strips the extension of the bundle name to get the moduleId', () => {
    let bundler = new BundlerMock();

    let config = {
      name: 'app-bundle.js'
    };
    sut = new Bundle(bundler, config);

    expect(sut.moduleId).toBe('app-bundle');
  });

  it('includes all sources as SourceInclusions', () => {
    let bundler = new BundlerMock();

    let config = {
      name: 'app-bundle.js',
      source: [
        'src/**/*.js',
        'othersrc/**/*.js'
      ]
    };
    sut = new Bundle(bundler, config);

    expect(sut.includes.length).toBe(2);
    expect(sut.includes.find(x => x.pattern === 'src/**/*.js'));
    expect(sut.includes.find(x => x.pattern === 'othersrc/**/*.js'));
  });

  it('source can be an object with include/exclude properties', () => {
    let bundler = new BundlerMock();

    let config = {
      name: 'app-bundle.js',
      source: {
        include: ['src/**/*.js'],
        exclude: ['src/test.js']
      }
    };
    sut = new Bundle(bundler, config);

    expect(sut.includes.length).toBe(1);
    expect(sut.includes.find(x => x.pattern === 'src/**/*.js'));
    expect(sut.excludes.length).toBe(1);
  });

  it('only includes dependencies that are included in the build', (done) => {
    let bundler = new BundlerMock();
    bundler.itemIncludedInBuild.and.callFake((dep) => {
      if (dep.name && dep.name === 'my-dev-plugin') return false;

      return true;
    });
    bundler.configureDependency.and.callFake(dep => {
      let depName = dep.name || dep;
      let description = new DependencyDescription(depName);

      description.loaderConfig = {
        name: depName,
        path: '../node_modules/' + depName,
        main: 'index.js'
      };

      return Promise.resolve(description);
    });

    let config = {
      name: 'app-bundle.js',
      dependencies: [
        'foo',
        {
          name: 'my-plugin',
          main: 'index',
          path: '../node_modules/my-plugin/'
        },
        {
          name: 'my-dev-plugin',
          main: 'index',
          path: '../node_modules/my-plugin/'
        }
      ]
    };
    Bundle.create(bundler, config)
    .then((bundle) => {
      sut = bundle;
      expect(sut.includes.length).toBe(2);
      expect(sut.includes.find(x => x.description.loaderConfig.name === 'my-dev-plugin')).toBeFalsy();
      done();
    }).catch(e => done.fail(e));
  });

  it('transforms all includes when build is required', (done) => {
    sut.requiresBuild = true;
    let spy1 = jasmine.createSpy('spy1').and.returnValue(Promise.resolve());
    let spy2 = jasmine.createSpy('spy2').and.returnValue(Promise.resolve());
    sut.includes = [{
      transform: spy1
    }, {
      transform: spy2
    }];

    sut.transform()
    .then(() => {
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
      done();
    }).catch(e => done.fail(e));
  });

  it('does not transforms includes when build is not required', (done) => {
    sut.requiresBuild = false;
    let spy1 = jasmine.createSpy('spy1').and.returnValue(Promise.resolve());
    let spy2 = jasmine.createSpy('spy2').and.returnValue(Promise.resolve());
    sut.includes = [{
      transform: spy1
    }, {
      transform: spy2
    }];

    sut.transform()
    .then(() => {
      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
      done();
    }).catch(e => done.fail(e));
  });

  it('getBundledModuleIds returns unique module ids', () => {
    sut.includes = [{
      getAllModuleIds: () => ['a', 'b']
    }, {
      getAllModuleIds: () => ['b', 'c']
    }];

    expect(sut.getBundledModuleIds()).toEqual(['a', 'b', 'c']);
  });

  it('getBundledModuleIds returns sorts module ids', () => {
    sut.includes = [{
      getAllModuleIds: () => ['d', 'b']
    }, {
      getAllModuleIds: () => ['b', 'a']
    }];

    expect(sut.getBundledModuleIds()).toEqual(['a', 'b', 'd']);
  });

  it('getBundledFiles returns all files of all includes', () => {
    let aFile = {path: 'a.js'};
    let bFile = {path: 'b.js'};
    let cFile = {path: 'c.js'};

    sut.includes = [{
      getAllFiles: () => [aFile, bFile]
    }, {
      getAllFiles: () => [cFile]
    }];

    expect(sut.getBundledFiles()).toEqual([aFile, bFile, cFile]);
  });

  it('getBundledFiles returns unique files of all includes', () => {
    let aFile = {path: 'a.js'};
    let bFile = {path: 'b.js'};
    let cFile = {path: 'c.js'};

    sut.includes = [{
      getAllFiles: () => [aFile, bFile]
    }, {
      getAllFiles: () => [cFile, cFile]
    }];

    expect(sut.getBundledFiles()).toEqual([aFile, bFile, cFile]);
  });

  it('configures dependencies in the same order as they were entered to prevent a wrong module load order', done => {
    let bundler = new BundlerMock();
    let configuredDependencies = [];
    bundler.configureDependency.and.callFake(dep => {
      let depName = dep.name || dep;

      let description = new DependencyDescription(depName);
      description.loaderConfig = {
        name: depName,
        path: '../node_modules/' + depName,
        main: 'index.js'
      };

      return new Promise(resolve => {
        if (depName === 'my-large-plugin') {
          setTimeout(() => {
            configuredDependencies.push(depName);
            resolve(description);
          }, 100);
        } else {
          configuredDependencies.push(depName);
          resolve(description);
        }
      });
    });
    bundler.itemIncludedInBuild.and.callFake((dep) => true);

    let config = {
      name: 'app-bundle.js',
      dependencies: [
        'foo',
        {
          name: 'my-large-plugin',
          main: 'index',
          path: '../node_modules/my-plugin/'
        },
        {
          name: 'my-other-plugin',
          main: 'index',
          path: '../node_modules/my-plugin/'
        }
      ]
    };

    Bundle.create(bundler, config)
    .then((bundle) => {
      expect(configuredDependencies[0]).toBe('foo');
      expect(configuredDependencies[1]).toBe('my-large-plugin');
      expect(configuredDependencies[2]).toBe('my-other-plugin');
      done();
    }).catch(e => {
      done.fail(e);
    });
  });

  it('add dependencies in the same order as they were entered to prevent a wrong module load order', done => {
    let bundler = new BundlerMock();
    bundler.configureDependency.and.callFake(dep => {
      let description = new DependencyDescription(dep.name || dep);
      description.loaderConfig = {
        name: dep.name || dep
      };

      return Promise.resolve(description);
    });
    bundler.itemIncludedInBuild.and.callFake((dep) => true);

    let config = {
      name: 'app-bundle.js',
      dependencies: [
        'foo',
        {
          name: 'my-large-plugin',
          main: 'index',
          path: '../node_modules/my-plugin/'
        },
        {
          name: 'my-other-plugin',
          main: 'index',
          path: '../node_modules/my-plugin/'
        }
      ]
    };

    const previousAddDependency = Bundle.prototype.addDependency;
    Bundle.prototype.addDependency = function(description) {
      return new Promise(resolve => {
        if (description.loaderConfig.name === 'my-large-plugin') {
          setTimeout(() => {
            this.includes.push({
              description: description
            });
            resolve();
          }, 200);
        } else {
          this.includes.push({
            description: description
          });
          resolve();
        }
      });
    };

    Bundle.create(bundler, config)
    .then((bundle) => {
      expect(bundle.includes[0].description.loaderConfig.name).toBe('foo');
      expect(bundle.includes[1].description.loaderConfig.name).toBe('my-large-plugin');
      expect(bundle.includes[2].description.loaderConfig.name).toBe('my-other-plugin');
      Bundle.prototype.addDependency = previousAddDependency;
      done();
    }).catch(e => {
      Bundle.prototype.addDependency = previousAddDependency;
      done.fail(e);
    });
  });
});
