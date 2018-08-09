'use strict';

const path = require('path');
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
        foo: 'src/bar',
        tad: 'src/tad/deep/'
      },
      build: { loader: {} }
    };
    let bundler = new Bundler(project, analyzer);
    expect(bundler.loaderConfig.paths.foo).toBe('bar');
    expect(bundler.loaderConfig.paths.tad).toBe('tad/deep');
  });

  it('configureDependency analyzes dependency with string', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    analyzer.analyze = dep => Promise.resolve({depResult: true});
    let bundler = new Bundler(project, analyzer);

    bundler.configureDependency('lorem')
      .then(description => {
        expect(description.depResult).toBe(true);
        done();
      })
      .catch(e => done.fail(e));
  });

  it('configureDependency analyzes dependency with loaderConfig', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    analyzer.reverseEngineer = dep => Promise.resolve({depResult: true});
    let bundler = new Bundler(project, analyzer);

    bundler.configureDependency({name: 'lorem'})
      .then(description => {
        expect(description.depResult).toBe(true);
        done();
      })
      .catch(e => done.fail(e));
  });

  it('configureDependency performs auto install', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    let installer = {
      install: jasmine.createSpy('install').and.returnValue(Promise.resolve())
    };

    analyzer.analyze = jasmine.createSpy('analyze')
      .and.returnValues(Promise.reject('fail'), Promise.resolve());

    let bundler = new Bundler(project, analyzer, installer);
    bundler.autoInstall = true;

    bundler.configureDependency('lorem')
      .then(description => {
        expect(analyzer.analyze).toHaveBeenCalledTimes(2);
        expect(analyzer.analyze.calls.argsFor(0)).toEqual(['lorem']);
        expect(analyzer.analyze.calls.argsFor(1)).toEqual(['lorem']);
        expect(installer.install).toHaveBeenCalledTimes(1);
        expect(installer.install).toHaveBeenCalledWith(['lorem']);
        expect(bundler.triedAutoInstalls.size).toBe(1);
        expect(bundler.triedAutoInstalls.has('lorem')).toBeTruthy();
        done();
      })
      .catch(e => done.fail(e));
  });

  it('configureDependency performs auto install, adds failure to black list', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    let installer = {
      install: jasmine.createSpy('install').and.returnValue(Promise.reject())
    };

    analyzer.analyze = jasmine.createSpy('analyze')
      .and.returnValue(Promise.reject('fail'));

    let bundler = new Bundler(project, analyzer, installer);
    bundler.autoInstall = true;

    bundler.configureDependency('lorem')
      .then(() => done.fail('should not pass'))
      .catch(() => {
        expect(analyzer.analyze).toHaveBeenCalledTimes(1);
        expect(analyzer.analyze.calls.argsFor(0)).toEqual(['lorem']);
        expect(installer.install).toHaveBeenCalledTimes(1);
        expect(installer.install).toHaveBeenCalledWith(['lorem']);
        expect(bundler.triedAutoInstalls.size).toBe(1);
        expect(bundler.triedAutoInstalls.has('lorem')).toBeTruthy();

        analyzer.analyze.calls.reset();
        installer.install.calls.reset();

        bundler.configureDependency('lorem')
          .then(() => done.fail('should not pass'))
          .catch(() => {
            expect(analyzer.analyze).toHaveBeenCalledTimes(1);
            expect(analyzer.analyze.calls.argsFor(0)).toEqual(['lorem']);
            expect(installer.install).not.toHaveBeenCalled();
            expect(bundler.triedAutoInstalls.size).toBe(1);
            expect(bundler.triedAutoInstalls.has('lorem')).toBeTruthy();
            done();
          });
      });
  });

  it('addNpmResource traces npm package', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    analyzer.analyze = nodeId => Promise.resolve({
      name: nodeId,
      loaderConfig: {
        name: nodeId,
        path: `../node_modules/${nodeId}`,
        main: 'index'
      }
    });

    let bundler = new Bundler(project, analyzer);

    let depInclusion = {};

    bundler.configTargetBundle = {
      addDependency: jasmine.createSpy('addDependency')
        .and.returnValue(Promise.resolve(depInclusion))
    };

    bundler.addNpmResource('lorem')
      .then(() => {
        expect(bundler.configTargetBundle.addDependency)
          .toHaveBeenCalled();
        expect(bundler.configTargetBundle.addDependency)
          .toHaveBeenCalledWith({
            name: 'lorem',
            loaderConfig: {
              name: 'lorem',
              path: '../node_modules/lorem',
              main: 'index'
            }
          });
        done();
      })
      .catch(e => done.fail(e));
  });

  it('addNpmResource traces npm package and additional js', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    analyzer.analyze = nodeId => Promise.resolve({
      name: nodeId,
      loaderConfig: {
        name: nodeId,
        path: `../node_modules/${nodeId}`,
        main: 'index'
      }
    });

    let bundler = new Bundler(project, analyzer);

    let depInclusion = {
      traceResource: jasmine.createSpy('traceResource')
    };

    bundler.configTargetBundle = {
      addDependency: jasmine.createSpy('addDependency')
        .and.returnValue(Promise.resolve(depInclusion))
    };

    bundler.addNpmResource('lorem/foo/bar')
      .then(() => {
        expect(bundler.configTargetBundle.addDependency)
          .toHaveBeenCalled();
        expect(bundler.configTargetBundle.addDependency)
          .toHaveBeenCalledWith({
            name: 'lorem',
            loaderConfig: {
              name: 'lorem',
              path: '../node_modules/lorem',
              main: 'index',
              lazyMain: true
            }
          });

        expect(depInclusion.traceResource).toHaveBeenCalled();
        expect(depInclusion.traceResource).toHaveBeenCalledWith('foo/bar');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('addNpmResource traces npm package and additional other resource', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    analyzer.analyze = nodeId => Promise.resolve({
      name: nodeId,
      loaderConfig: {
        name: nodeId,
        path: `../node_modules/${nodeId}`,
        main: 'index'
      }
    });

    let bundler = new Bundler(project, analyzer);

    let depInclusion = {
      traceResource: jasmine.createSpy('traceResource')
    };

    bundler.configTargetBundle = {
      addDependency: jasmine.createSpy('addDependency')
        .and.returnValue(Promise.resolve(depInclusion))
    };

    bundler.addNpmResource('lorem/foo/bar.css')
      .then(() => {
        expect(bundler.configTargetBundle.addDependency)
          .toHaveBeenCalled();
        expect(bundler.configTargetBundle.addDependency)
          .toHaveBeenCalledWith({
            name: 'lorem',
            loaderConfig: {
              name: 'lorem',
              path: '../node_modules/lorem',
              main: 'index',
              lazyMain: true
            }
          });

        expect(depInclusion.traceResource).toHaveBeenCalled();
        expect(depInclusion.traceResource).toHaveBeenCalledWith('foo/bar.css');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('addNpmResource traces scoped npm package', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    analyzer.analyze = nodeId => Promise.resolve({
      name: nodeId,
      loaderConfig: {
        name: nodeId,
        path: `../node_modules/${nodeId}`,
        main: 'index'
      }
    });

    let bundler = new Bundler(project, analyzer);

    let depInclusion = {};

    bundler.configTargetBundle = {
      addDependency: jasmine.createSpy('addDependency')
        .and.returnValue(Promise.resolve(depInclusion))
    };

    bundler.addNpmResource('@scope/lorem')
      .then(() => {
        expect(bundler.configTargetBundle.addDependency)
          .toHaveBeenCalled();
        expect(bundler.configTargetBundle.addDependency)
          .toHaveBeenCalledWith({
            name: '@scope/lorem',
            loaderConfig: {
              name: '@scope/lorem',
              path: '../node_modules/@scope/lorem',
              main: 'index'
            }
          });
        done();
      })
      .catch(e => done.fail(e));
  });

  it('addNpmResource traces scoped npm package and additional js', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    analyzer.analyze = nodeId => Promise.resolve({
      name: nodeId,
      loaderConfig: {
        name: nodeId,
        path: `../node_modules/${nodeId}`,
        main: 'index'
      }
    });

    let bundler = new Bundler(project, analyzer);

    let depInclusion = {
      traceResource: jasmine.createSpy('traceResource')
    };

    bundler.configTargetBundle = {
      addDependency: jasmine.createSpy('addDependency')
        .and.returnValue(Promise.resolve(depInclusion))
    };

    bundler.addNpmResource('@scope/lorem/foo/bar')
      .then(() => {
        expect(bundler.configTargetBundle.addDependency)
          .toHaveBeenCalled();
        expect(bundler.configTargetBundle.addDependency)
          .toHaveBeenCalledWith({
            name: '@scope/lorem',
            loaderConfig: {
              name: '@scope/lorem',
              path: '../node_modules/@scope/lorem',
              main: 'index',
              lazyMain: true
            }
          });

        expect(depInclusion.traceResource).toHaveBeenCalled();
        expect(depInclusion.traceResource).toHaveBeenCalledWith('foo/bar');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('addNpmResource traces scoped npm package and additional other resource', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    analyzer.analyze = nodeId => Promise.resolve({
      name: nodeId,
      loaderConfig: {
        name: nodeId,
        path: `../node_modules/${nodeId}`,
        main: 'index'
      }
    });

    let bundler = new Bundler(project, analyzer);

    let depInclusion = {
      traceResource: jasmine.createSpy('traceResource')
    };

    bundler.configTargetBundle = {
      addDependency: jasmine.createSpy('addDependency')
        .and.returnValue(Promise.resolve(depInclusion))
    };

    bundler.addNpmResource('@scope/lorem/foo/bar.css')
      .then(() => {
        expect(bundler.configTargetBundle.addDependency)
          .toHaveBeenCalled();
        expect(bundler.configTargetBundle.addDependency)
          .toHaveBeenCalledWith({
            name: '@scope/lorem',
            loaderConfig: {
              name: '@scope/lorem',
              path: '../node_modules/@scope/lorem',
              main: 'index',
              lazyMain: true
            }
          });

        expect(depInclusion.traceResource).toHaveBeenCalled();
        expect(depInclusion.traceResource).toHaveBeenCalledWith('foo/bar.css');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('addNpmResource trace main of npm package', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    let bundler = new Bundler(project, analyzer);

    let depInclusion = {
      description: {name: 'lorem'},
      traceMain: jasmine.createSpy('traceMain')
        .and.returnValue(Promise.resolve())
    };

    bundler.getDependencyInclusions = () => [depInclusion];

    bundler.addNpmResource('lorem')
      .then(() => {
        expect(depInclusion.traceMain).toHaveBeenCalled();
        done();
      })
      .catch(e => done.fail(e));
  });

  it('addNpmResource trace resource of npm package', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    let bundler = new Bundler(project, analyzer);

    let depInclusion = {
      description: {name: 'lorem'},
      traceResource: jasmine.createSpy('traceResource')
        .and.returnValue(Promise.resolve())
    };

    bundler.getDependencyInclusions = () => [depInclusion];

    bundler.addNpmResource('lorem/foo/bar')
      .then(() => {
        expect(depInclusion.traceResource).toHaveBeenCalled();
        expect(depInclusion.traceResource).toHaveBeenCalledWith('foo/bar');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('addNpmResource trace main of scoped npm package', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    let bundler = new Bundler(project, analyzer);

    let depInclusion = {
      description: {name: '@scope/lorem'},
      traceMain: jasmine.createSpy('traceMain')
        .and.returnValue(Promise.resolve())
    };

    bundler.getDependencyInclusions = () => [depInclusion];

    bundler.addNpmResource('@scope/lorem')
      .then(() => {
        expect(depInclusion.traceMain).toHaveBeenCalled();
        done();
      })
      .catch(e => done.fail(e));
  });

  it('addNpmResource trace resource of scoped npm package', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    let bundler = new Bundler(project, analyzer);

    let depInclusion = {
      description: {name: '@scope/lorem'},
      traceResource: jasmine.createSpy('traceResource')
        .and.returnValue(Promise.resolve())
    };

    bundler.getDependencyInclusions = () => [depInclusion];

    bundler.addNpmResource('@scope/lorem/foo/bar')
      .then(() => {
        expect(depInclusion.traceResource).toHaveBeenCalled();
        expect(depInclusion.traceResource).toHaveBeenCalledWith('foo/bar');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('build brings missing deps', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    let bundler = new Bundler(project, analyzer);

    bundler.items = [
      {
        transform: jasmine.createSpy('transform1')
          .and.returnValues(['f/bar', 'lorem', 'foo/lo'], undefined)
      },
      {
        transform: jasmine.createSpy('transform2')
          .and.returnValues(['foo', 'had'], undefined)
      }
    ];

    let bundle = {
      getRawBundledModuleIds: () => ['had', 'f/bar/index'],
      addAlias: jasmine.createSpy('addAlias')
    };

    bundler.bundles = [bundle];

    bundler.addNpmResource = jasmine.createSpy('addNpmResource')
      .and.returnValue(Promise.resolve());

    bundler.build()
      .then(() => {
        expect(bundler.addNpmResource).toHaveBeenCalledTimes(3);
        expect(bundler.addNpmResource.calls.argsFor(0)).toEqual(['foo']);
        expect(bundler.addNpmResource.calls.argsFor(1)).toEqual(['foo/lo']);
        expect(bundler.addNpmResource.calls.argsFor(2)).toEqual(['lorem']);

        expect(bundle.addAlias).toHaveBeenCalledTimes(1);
        expect(bundle.addAlias).toHaveBeenCalledWith('f/bar', 'f/bar/index');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('build supports onRequiringModule to ignore module', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    let bundler = new Bundler(project, analyzer);

    bundler.items = [
      {
        transform: jasmine.createSpy('transform1')
          .and.returnValues(['f/bar', 'lorem', 'foo/lo'], undefined)
      },
      {
        transform: jasmine.createSpy('transform2')
          .and.returnValues(['foo', 'had'], undefined)
      }
    ];

    let bundle = {
      getRawBundledModuleIds: () => ['had', 'f/bar/index'],
      addAlias: jasmine.createSpy('addAlias')
    };

    bundler.bundles = [bundle];

    bundler.addNpmResource = jasmine.createSpy('addNpmResource')
      .and.returnValue(Promise.resolve());

    bundler.build({
      onRequiringModule: function(moduleId) {
        if (moduleId === 'lorem') return false;
      }
    })
      .then(() => {
        expect(bundler.addNpmResource).toHaveBeenCalledTimes(2);
        expect(bundler.addNpmResource.calls.argsFor(0)).toEqual(['foo']);
        expect(bundler.addNpmResource.calls.argsFor(1)).toEqual(['foo/lo']);

        expect(bundle.addAlias).toHaveBeenCalledTimes(1);
        expect(bundle.addAlias).toHaveBeenCalledWith('f/bar', 'f/bar/index');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('build supports onRequiringModule to replace deps', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    let bundler = new Bundler(project, analyzer);

    bundler.items = [
      {
        transform: jasmine.createSpy('transform1')
          .and.returnValues(['f/bar', 'lorem', 'foo/lo'], undefined)
      },
      {
        transform: jasmine.createSpy('transform2')
          .and.returnValues(['foo', 'had'], undefined)
      }
    ];

    let bundle = {
      getRawBundledModuleIds: () => ['had', 'f/bar/index'],
      addAlias: jasmine.createSpy('addAlias')
    };

    bundler.bundles = [bundle];

    bundler.addNpmResource = jasmine.createSpy('addNpmResource')
      .and.returnValue(Promise.resolve());

    bundler.build({
      onRequiringModule: function(moduleId) {
        if (moduleId === 'lorem') {
          return new Promise(resolve => {
            setTimeout(() => resolve(['lorem-a', 'lorem-b']), 50);
          });
        }
      }
    })
      .then(() => {
        expect(bundler.addNpmResource).toHaveBeenCalledTimes(4);
        expect(bundler.addNpmResource.calls.argsFor(0)).toEqual(['foo']);
        expect(bundler.addNpmResource.calls.argsFor(1)).toEqual(['foo/lo']);
        expect(bundler.addNpmResource.calls.argsFor(2)).toEqual(['lorem-a']);
        expect(bundler.addNpmResource.calls.argsFor(3)).toEqual(['lorem-b']);

        expect(bundle.addAlias).toHaveBeenCalledTimes(1);
        expect(bundle.addAlias).toHaveBeenCalledWith('f/bar', 'f/bar/index');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('build supports onRequiringModule to provide implementation', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    let bundler = new Bundler(project, analyzer);

    bundler.items = [
      {
        transform: jasmine.createSpy('transform1')
          .and.returnValues(['f/bar', 'lorem', 'foo/lo'], undefined)
      },
      {
        transform: jasmine.createSpy('transform2')
          .and.returnValues(['foo', 'had'], undefined)
      }
    ];

    let bundle = {
      getRawBundledModuleIds: () => ['had', 'f/bar/index'],
      addAlias: jasmine.createSpy('addAlias')
    };

    bundler.bundles = [bundle];

    bundler.addFile = jasmine.createSpy('addFile').and.returnValue(null);

    bundler.addNpmResource = jasmine.createSpy('addNpmResource')
      .and.returnValue(Promise.resolve());

    bundler.build({
      onRequiringModule: function(moduleId) {
        if (moduleId === 'lorem') return "define(['lorem-a', 'lorem-b'], function() {return 1;});";
      }
    })
      .then(() => {
        expect(bundler.addNpmResource).toHaveBeenCalledTimes(2);
        expect(bundler.addNpmResource.calls.argsFor(0)).toEqual(['foo']);
        expect(bundler.addNpmResource.calls.argsFor(1)).toEqual(['foo/lo']);

        expect(bundler.addFile).toHaveBeenCalledTimes(1);
        expect(bundler.addFile).toHaveBeenCalledWith({
          path: path.resolve('src', 'lorem.js'),
          contents: "define(['lorem-a', 'lorem-b'], function() {return 1;});"
        });

        expect(bundle.addAlias).toHaveBeenCalledTimes(1);
        expect(bundle.addAlias).toHaveBeenCalledWith('f/bar', 'f/bar/index');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('build swallows onRequiringModule exception', done => {
    let project = {
      paths: {
        root: 'src',
        foo: 'bar'
      },
      build: { loader: {} }
    };

    let bundler = new Bundler(project, analyzer);

    bundler.items = [
      {
        transform: jasmine.createSpy('transform1')
          .and.returnValues(['f/bar', 'lorem', 'foo/lo'], undefined)
      },
      {
        transform: jasmine.createSpy('transform2')
          .and.returnValues(['foo', 'had'], undefined)
      }
    ];

    let bundle = {
      getRawBundledModuleIds: () => ['had', 'f/bar/index'],
      addAlias: jasmine.createSpy('addAlias')
    };

    bundler.bundles = [bundle];

    bundler.addNpmResource = jasmine.createSpy('addNpmResource')
      .and.returnValue(Promise.resolve());

    bundler.build({
      onRequiringModule: function(moduleId) {
        if (moduleId === 'lorem') {
          throw new Error('panic!');
        }
      }
    })
      .then(() => {
        expect(bundler.addNpmResource).toHaveBeenCalledTimes(3);
        expect(bundler.addNpmResource.calls.argsFor(0)).toEqual(['foo']);
        expect(bundler.addNpmResource.calls.argsFor(1)).toEqual(['foo/lo']);
        expect(bundler.addNpmResource.calls.argsFor(2)).toEqual(['lorem']);

        expect(bundle.addAlias).toHaveBeenCalledTimes(1);
        expect(bundle.addAlias).toHaveBeenCalledWith('f/bar', 'f/bar/index');
        done();
      })
      .catch(e => done.fail(e));
  });


  afterEach(() => {
    cliOptionsMock.detach();
  });
});
