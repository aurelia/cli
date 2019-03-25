const BundlerMock = require('../../mocks/bundler');
const SourceInclusion = require('../../../lib/build/source-inclusion').SourceInclusion;
const mockfs = require('mock-fs');
const Minimatch = require('minimatch').Minimatch;
const path = require('path');

describe('the SourceInclusion module', () => {
  let bundler;

  beforeEach(() => {
    bundler = new BundlerMock();
  });

  afterEach(() => {
    mockfs.restore();
  });

  it('captures pattern and excludes', () => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      excludes: ['**/*.css'],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let sut = new SourceInclusion(bundle, 'foo*.js');
    sut.trySubsume({path: 'foo-bar.js'});
    expect(sut.items.length).toBe(1);
    expect(sut.items[0].path).toBe('foo-bar.js');
    expect(sut.items[0].includedBy).toBe(sut);
    expect(sut.items[0].includedIn).toBe(bundle);

    sut.trySubsume({path: 'fo-bar.js'});
    expect(sut.items.length).toBe(1);

    sut.trySubsume({path: 'foo-bar.css'});
    expect(sut.items.length).toBe(1);
  });

  it('captures [pattern] and excludes', () => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      excludes: ['**/*.css'],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let sut = new SourceInclusion(bundle, '[foo*.js]');
    sut.trySubsume({path: 'foo-bar.js'});
    expect(sut.items.length).toBe(1);
    expect(sut.items[0].path).toBe('foo-bar.js');
    expect(sut.items[0].includedBy).toBe(sut);
    expect(sut.items[0].includedIn).toBe(bundle);

    sut.trySubsume({path: 'fo-bar.js'});
    expect(sut.items.length).toBe(1);

    sut.trySubsume({path: 'foo-bar.css'});
    expect(sut.items.length).toBe(1);
  });

  it('getAllModuleIds gets all module ids, getAllFiles gets all items', () => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      excludes: ['**/*.css'],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let sut = new SourceInclusion(bundle, '**/*.js');
    sut.trySubsume({path: 'foo-bar.js', moduleId: 'foo-bar.js'});
    sut.trySubsume({path: 'fop/bar.js', moduleId: 'fop/bar.js'});

    expect(sut.getAllModuleIds().sort()).toEqual(['foo-bar.js', 'fop/bar.js']);
    expect(sut.getAllFiles()).toEqual([
      {path: 'foo-bar.js', moduleId: 'foo-bar.js', includedBy: sut, includedIn: bundle},
      {path: 'fop/bar.js', moduleId: 'fop/bar.js', includedBy: sut, includedIn: bundle}
    ]);
  });

  it('addAllMatchingResources adds all matching files', done => {
    let bundle = {
      bundler: bundler,
      addAlias: jasmine.createSpy('addAlias'),
      includes: [],
      excludes: ['**/*.css'],
      createMatcher: function(pattern) {
        return new Minimatch(pattern, {
          dot: true
        });
      }
    };

    let sut = new SourceInclusion(bundle, '../node_modules/foo/**/*.js');
    sut._getProjectRoot = () => 'src';
    mockfs({
      'node_modules/foo/foo-bar.js': 'some-content',
      'node_modules/foo/fop/bar.js': 'some-content'
    });

    sut.addAllMatchingResources()
      .then(() => {
        expect(bundler.addFile).toHaveBeenCalledTimes(2);
        let arg0 = bundler.addFile.calls.argsFor(0);
        let arg1 = bundler.addFile.calls.argsFor(1);

        expect(arg0[1]).toEqual(sut);
        expect(arg1[1]).toEqual(sut);

        expect(arg0[0].path).toEqual(path.resolve('node_modules/foo/foo-bar.js'));
        expect(arg1[0].path).toEqual(path.resolve('node_modules/foo/fop/bar.js'));
        done();
      })
      .catch(e => done.fail(e));
  });
});
