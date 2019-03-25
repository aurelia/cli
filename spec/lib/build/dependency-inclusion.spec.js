const BundlerMock = require('../../mocks/bundler');
const SourceInclusion = require('../../../lib/build/source-inclusion').SourceInclusion;
const DependencyInclusion = require('../../../lib/build/dependency-inclusion').DependencyInclusion;
const DependencyDescription = require('../../../lib/build/dependency-description').DependencyDescription;
const mockfs = require('mock-fs');
const Minimatch = require('minimatch').Minimatch;
const path = require('path');

describe('the DependencyInclusion module', () => {
  let bundler;
  let originalAddAllMatchingResources;
  let originalGetAllModuleIds;

  beforeAll(() => {
    originalAddAllMatchingResources = SourceInclusion.prototype.addAllMatchingResources;
    originalGetAllModuleIds = SourceInclusion.prototype.getAllModuleIds;

    SourceInclusion.prototype.addAllMatchingResources = function() {
      return Promise.resolve();
    };

    SourceInclusion.prototype.getAllModuleIds = function() {
      if (this.includedBy && !this.pattern.match(/\?|\{|\*/)) {
        // simple pattern
        let id = this.includedBy.description.name + '/' + this.pattern.slice(this.includedBy.description.loaderConfig.path.length + 1).replace(/\\/g, '/');
        if (id.endsWith('.js')) id = id.slice(0, -3);
        return [id];
      }
      return [];
    };
  });

  afterAll(() => {
    SourceInclusion.prototype.addAllMatchingResources = originalAddAllMatchingResources;
    SourceInclusion.prototype.getAllModuleIds = originalGetAllModuleIds;
  });

  beforeEach(() => {
    bundler = new BundlerMock();
  });

  afterEach(() => {
    mockfs.restore();
  });

  it('adds main file to the bundle when there is a main file', done => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let description = new DependencyDescription('my-package', 'npm');
    description.loaderConfig = {
      path: '../node_modules/my-package',
      name: 'my-package',
      main: 'index'
    };

    let sut = new DependencyInclusion(bundle, description);
    sut.traceResources()
      .then(() => {
        expect(bundle.includes.length).toBe(1);
        expect(bundle.includes[0].pattern).toBe(path.join('..', 'node_modules', 'my-package', 'index.js'));
        expect(bundle.addAlias).toHaveBeenCalledWith('my-package', 'my-package/index');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('does not alias main file when main file is not js file', done => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let description = new DependencyDescription('my-package', 'npm');
    description.loaderConfig = {
      path: '../node_modules/my-package',
      name: 'my-package',
      main: 'index.css'
    };

    let sut = new DependencyInclusion(bundle, description);
    sut.traceResources()
      .then(() => {
        expect(bundle.includes.length).toBe(1);
        expect(bundle.includes[0].pattern).toBe(path.join('..', 'node_modules', 'my-package', 'index.css'));
        expect(bundle.addAlias).not.toHaveBeenCalled();
        done();
      })
      .catch(e => done.fail(e));
  });

  it('aliases main file when both package name and main file share same non-js extension', done => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let description = new DependencyDescription('my-package.css', 'npm');
    description.loaderConfig = {
      path: '../node_modules/my-package.css',
      name: 'my-package',
      main: 'index.css'
    };

    let sut = new DependencyInclusion(bundle, description);
    sut.traceResources()
      .then(() => {
        expect(bundle.includes.length).toBe(1);
        expect(bundle.includes[0].pattern).toBe(path.join('..', 'node_modules', 'my-package.css', 'index.css'));
        expect(bundle.addAlias).toHaveBeenCalledWith('my-package.css', 'my-package.css/index.css');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('does not add main file to the bundle when lazyMain is on', done => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let description = new DependencyDescription('my-package', 'npm');
    description.loaderConfig = {
      path: '../node_modules/my-package',
      name: 'my-package',
      main: 'index',
      lazyMain: true
    };

    // eslint-disable-next-line no-unused-vars
    let sut = new DependencyInclusion(bundle, description);

    sut.traceResources()
      .then(() => {
        expect(bundle.includes.length).toBe(0);
        expect(bundle.addAlias).not.toHaveBeenCalled();
        done();
      })
      .catch(e => done.fail(e));
  });

  it('adds main file and resource file to the bundle', done => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let description = new DependencyDescription('my-package', 'npm');
    description.loaderConfig = {
      path: '../node_modules/my-package',
      name: 'my-package',
      main: 'index',
      resources: [
        'lib/foo.js',
        'lib/foo.css'
      ]
    };

    let sut = new DependencyInclusion(bundle, description);
    sut.traceResources()
      .then(() => {
        expect(bundle.includes.length).toBe(3);
        expect(bundle.includes[0].pattern).toBe(path.join('..', 'node_modules', 'my-package', 'index.js'));
        expect(bundle.includes[1].pattern).toBe(path.join('..', 'node_modules', 'my-package', 'lib', 'foo.js'));
        expect(bundle.includes[2].pattern).toBe(path.join('..', 'node_modules', 'my-package', 'lib', 'foo.css'));
        expect(bundle.addAlias).toHaveBeenCalledWith('my-package', 'my-package/index');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('traceResource at runtime add resource to bundle', done => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let description = new DependencyDescription('my-package', 'npm');
    description.loaderConfig = {
      path: '../node_modules/my-package',
      name: 'my-package',
      main: 'index',
      lazyMain: true
    };

    mockfs({
      'node_modules/my-package/lib/foo.js': 'some-content'
    });

    let sut = new DependencyInclusion(bundle, description);
    sut._getProjectRoot = () => 'src';
    sut.traceResource('lib/foo')
      .then(() => {
        expect(bundle.includes.length).toBe(1);
        expect(bundle.includes[0].pattern).toBe(path.join('..', 'node_modules', 'my-package', 'lib', 'foo.js'));
        expect(bundle.addAlias).not.toHaveBeenCalled();
        done();
      })
      .catch(e => done.fail(e));
  });

  it('traceResource at runtime can smartly add resource to bundle', done => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let description = new DependencyDescription('my-package', 'npm');
    description.loaderConfig = {
      path: '../node_modules/my-package',
      name: 'my-package',
      main: 'dist/js/index',
      lazyMain: true
    };

    mockfs({
      'node_modules/my-package/dist/js/foo.js': 'some-content',
      'node_modules/my-package/dist/css/bar.css': 'some-content'
    });

    let sut = new DependencyInclusion(bundle, description);
    sut._getProjectRoot = () => 'src';
    sut.traceResource('foo')
      .then(() => sut.traceResource('css/bar.css'))
      .then(() => {
        expect(bundle.includes.length).toBe(2);
        expect(bundle.includes[0].pattern).toBe(path.join('..', 'node_modules', 'my-package', 'dist', 'js', 'foo.js'));
        expect(bundle.includes[1].pattern).toBe(path.join('..', 'node_modules', 'my-package', 'dist', 'css', 'bar.css'));
        expect(bundle.addAlias).toHaveBeenCalledTimes(2);
        expect(bundle.addAlias.calls.argsFor(0)).toEqual(['my-package/foo', 'my-package/dist/js/foo']);
        expect(bundle.addAlias.calls.argsFor(1)).toEqual(['my-package/css/bar.css', 'my-package/dist/css/bar.css']);
        done();
      })
      .catch(e => done.fail(e));
  });

  it('traceResource at runtime ignores resource could not be found (but prints logger.error)', done => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let description = new DependencyDescription('my-package', 'npm');
    description.loaderConfig = {
      path: '../node_modules/my-package',
      name: 'my-package',
      main: 'dist/js/index',
      lazyMain: true
    };

    mockfs({
      'node_modules/my-package/dist/js/foo.js': 'some-content',
      'node_modules/my-package/dist/css/bar.css': 'some-content'
    });

    let sut = new DependencyInclusion(bundle, description);
    sut._getProjectRoot = () => 'src';
    sut.traceResource('lorem.css')
      .then(() => {
        expect(bundle.includes.length).toBe(0);
        expect(bundle.addAlias).not.toHaveBeenCalled();
        done();
      })
      .catch(e => done.fail(e));
  });

  it('traceResource at runtime add json resource to bundle', done => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let description = new DependencyDescription('my-package', 'npm');
    description.loaderConfig = {
      path: '../node_modules/my-package',
      name: 'my-package',
      main: 'index',
      lazyMain: true
    };

    mockfs({
      'node_modules/my-package/lib/foo.json': 'some-content'
    });

    let sut = new DependencyInclusion(bundle, description);
    sut._getProjectRoot = () => 'src';
    sut.traceResource('lib/foo')
      .then(() => {
        expect(bundle.includes.length).toBe(1);
        expect(bundle.includes[0].pattern).toBe(path.join('..', 'node_modules', 'my-package', 'lib', 'foo.json'));
        expect(bundle.addAlias).toHaveBeenCalledWith('my-package/lib/foo', 'my-package/lib/foo.json');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('traceResource at runtime add index resource to bundle', done => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let description = new DependencyDescription('my-package', 'npm');
    description.loaderConfig = {
      path: '../node_modules/my-package',
      name: 'my-package',
      main: 'index',
      lazyMain: true
    };

    mockfs({
      'node_modules/my-package/lib/foo/index.js': 'some-content'
    });

    let sut = new DependencyInclusion(bundle, description);
    sut._getProjectRoot = () => 'src';
    sut.traceResource('lib/foo')
      .then(() => {
        expect(bundle.includes.length).toBe(1);
        expect(bundle.includes[0].pattern).toBe(path.join('..', 'node_modules', 'my-package', 'lib', 'foo', 'index.js'));
        expect(bundle.addAlias).toHaveBeenCalledWith('my-package/lib/foo', 'my-package/lib/foo/index');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('traceResource at runtime add index.json resource to bundle', done => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let description = new DependencyDescription('my-package', 'npm');
    description.loaderConfig = {
      path: '../node_modules/my-package',
      name: 'my-package',
      main: 'index',
      lazyMain: true
    };

    mockfs({
      'node_modules/my-package/lib/foo/index.json': 'some-content'
    });

    let sut = new DependencyInclusion(bundle, description);
    sut._getProjectRoot = () => 'src';
    sut.traceResource('lib/foo')
      .then(() => {
        expect(bundle.includes.length).toBe(1);
        expect(bundle.includes[0].pattern).toBe(path.join('..', 'node_modules', 'my-package', 'lib', 'foo', 'index.json'));
        expect(bundle.addAlias).toHaveBeenCalledWith('my-package/lib/foo', 'my-package/lib/foo/index.json');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('traceResource at runtime add resource described by folder package.json to bundle', done => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let description = new DependencyDescription('my-package', 'npm');
    description.loaderConfig = {
      path: '../node_modules/my-package',
      name: 'my-package',
      main: 'index',
      lazyMain: true
    };

    mockfs({
      'node_modules/my-package/lib/foo/package.json': '{"main":"fmain","module":"fmodule"}',
      'node_modules/my-package/lib/foo/fmodule.js': 'some-content'
    });

    let sut = new DependencyInclusion(bundle, description);
    sut._getProjectRoot = () => 'src';
    sut.traceResource('lib/foo')
      .then(() => {
        expect(bundle.includes.length).toBe(1);
        expect(bundle.includes[0].pattern).toBe(path.join('..', 'node_modules', 'my-package', 'lib', 'foo', 'fmodule.js'));
        expect(bundle.addAlias).toHaveBeenCalledWith('my-package/lib/foo', 'my-package/lib/foo/fmodule');
        done();
      })
      .catch(e => done.fail(e));
  });

  it('conventionalAliases removes common folder', done => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let description = new DependencyDescription('my-package', 'npm');
    description.loaderConfig = {
      path: '../node_modules/my-package',
      name: 'my-package',
      main: 'lib/cjs/foo',
      resources: [
        'lib/cjs/foo1.js',
        'lib/cjs/foo1.css'
      ]
    };

    let sut = new DependencyInclusion(bundle, description);
    sut.traceResources()
      .then(() => {
        expect(sut.conventionalAliases()).toEqual({
          'my-package/foo': 'my-package/lib/cjs/foo',
          'my-package/foo1': 'my-package/lib/cjs/foo1',
          'my-package/foo1.css': 'my-package/lib/cjs/foo1.css'
        });
        done();
      })
      .catch(e => done.fail(e));
  });

  it('conventionalAliases removes common folder, but not common name', done => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let description = new DependencyDescription('my-package', 'npm');
    description.loaderConfig = {
      path: '../node_modules/my-package',
      name: 'my-package',
      main: 'foo',
      resources: [
        'foo1.js',
        'foo1.css'
      ]
    };

    let sut = new DependencyInclusion(bundle, description);
    sut.traceResources()
      .then(() => {
        expect(sut.conventionalAliases()).toEqual({});
        done();
      })
      .catch(e => done.fail(e));
  });
});
