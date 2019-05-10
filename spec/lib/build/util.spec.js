const path = require('path');
const Utils = require('../../../lib/build/utils');

describe('the Utils.runSequentially function', () => {
  it('calls the callback function for all items', (d) => {
    let items = [{ name: 'first' }, { name: 'second' }];
    let cb = jasmine.createSpy('cb').and.returnValue(Promise.resolve());
    Utils.runSequentially(items, cb).then(() => {
      expect(cb.calls.count()).toBe(2);
      expect(cb.calls.argsFor(0)[0].name).toBe('first');
      expect(cb.calls.argsFor(1)[0].name).toBe('second');
      d();
    });
  });

  it('runs in sequence', (d) => {
    let items = [{ name: 'first' }, { name: 'second' }, { name: 'third' }];
    let cb = jasmine.createSpy('cb').and.callFake((item) => {
      return new Promise(resolve => {
        if (item.name === 'first' || item.name === 'second') {
          setTimeout(() => resolve(), 200);
        } else {
          resolve();
        }
      });
    });
    Utils.runSequentially(items, cb).then(() => {
      expect(cb.calls.argsFor(0)[0].name).toBe('first');
      expect(cb.calls.argsFor(1)[0].name).toBe('second');
      expect(cb.calls.argsFor(2)[0].name).toBe('third');
      d();
    });
  });

  it('handles empty items array', (done) => {
    let items = [];
    Utils.runSequentially(items, () => {})
      .catch(e => {
        done.fail(e, '', 'expected no error');
        throw e;
      })
      .then(() => {
        done();
      });
  });
});

describe('the Utils.createSrcFileRegex function', () => {
  it('matches script tag with double quotes', () => {
    expect('<script src="scripts/vendor-bundle.js"></script>'.match(Utils.createSrcFileRegex('scripts', 'vendor-bundle'))).not.toBeFalsy();
  });
  it('matches script tag with single quotes', () => {
    expect('<script src=\'scripts/vendor-bundle.js\'></script>'.match(Utils.createSrcFileRegex('scripts', 'vendor-bundle'))).not.toBeFalsy();
  });
  it('matches script tag without quotes', () => {
    expect('<script src=scripts/vendor-bundle.js></script>'.match(Utils.createSrcFileRegex('scripts', 'vendor-bundle'))).not.toBeFalsy();
  });
  it('does not match other bundles', () => {
    expect('<script src=scripts/app-bundle.js></script>'.match(Utils.createSrcFileRegex('scripts', 'vendor-bundle'))).toBeFalsy();
  });
});

describe('the Utils.moduleIdWithPlugin function', () => {
  it('generates requirejs style module id', () => {
    expect(Utils.moduleIdWithPlugin('foo/bar', 'plugin', 'require')).toBe('plugin!foo/bar');
  });

  it('generates systemjs style module id', () => {
    expect(Utils.moduleIdWithPlugin('foo/bar', 'plugin', 'system')).toBe('foo/bar!plugin');
  });

  it('complains unknown type', () => {
    expect(() => Utils.moduleIdWithPlugin('foo/bar', 'plugin', 'unknown')).toThrow();
  });
});

describe('the Utils.couldMissGulpPreprocess function', () => {
  it('returns false for js/html/css files', () => {
    expect(Utils.couldMissGulpPreprocess('foo/bar')).toBeFalsy();
    expect(Utils.couldMissGulpPreprocess('foo/bar.js')).toBeFalsy();
    expect(Utils.couldMissGulpPreprocess('foo/bar.html')).toBeFalsy();
    expect(Utils.couldMissGulpPreprocess('bar.css')).toBeFalsy();
  });

  it('returns true for unknown file extension', () => {
    expect(Utils.couldMissGulpPreprocess('foo/bar.json')).toBeTruthy();
    expect(Utils.couldMissGulpPreprocess('foo/bar.yaml')).toBeTruthy();
  });
});

describe('the Utils.nodejsLoad function', () => {
  let mockfs;

  beforeEach(() => {
    mockfs = require('mock-fs');
    const fsConfig = {};
    mockfs(fsConfig);
  });

  afterEach(() => {
    mockfs.restore();
  });

  it('load file first', () => {
    const fsConfig = {};
    fsConfig[path.join('foo', 'bar')] = 'bar';
    fsConfig[path.join('foo', 'bar.js')] = 'js';
    fsConfig[path.join('foo', 'bar.json')] = 'json';
    mockfs(fsConfig);
    expect(Utils.nodejsLoad(path.resolve('foo', 'bar'))).toBe(path.resolve('foo', 'bar'));
  });

  it('load .js file first', () => {
    const fsConfig = {};
    fsConfig[path.join('foo', 'bar.js')] = 'js';
    fsConfig[path.join('foo', 'bar.json')] = 'json';
    mockfs(fsConfig);
    expect(Utils.nodejsLoad(path.resolve('foo', 'bar'))).toBe(path.resolve('foo', 'bar.js'));
    expect(Utils.nodejsLoad(path.resolve('foo', 'bar.js'))).toBe(path.resolve('foo', 'bar.js'));
    expect(Utils.nodejsLoad(path.resolve('foo', 'bar.json'))).toBe(path.resolve('foo', 'bar.json'));
  });

  it('load .json file', () => {
    const fsConfig = {};
    fsConfig[path.join('foo', 'bar.json')] = 'json';
    mockfs(fsConfig);
    expect(Utils.nodejsLoad(path.resolve('foo', 'bar'))).toBe(path.resolve('foo', 'bar.json'));
    expect(Utils.nodejsLoad(path.resolve('foo', 'bar.json'))).toBe(path.resolve('foo', 'bar.json'));
    expect(Utils.nodejsLoad(path.resolve('foo', 'bar.js'))).toBeUndefined();
  });

  it('load directory', () => {
    const fsConfig = {};
    fsConfig[path.join('foo', 'bar', 'index.js')] = 'bar/index';
    fsConfig[path.join('foo', 'bar', 'index.json')] = 'bar/index.json';
    mockfs(fsConfig);
    expect(Utils.nodejsLoad(path.resolve('foo', 'bar'))).toBe(path.resolve('foo', 'bar', 'index.js'));
  });

  it('load directory .json', () => {
    const fsConfig = {};
    fsConfig[path.join('foo', 'bar', 'index.json')] = 'bar/index.json';
    mockfs(fsConfig);
    expect(Utils.nodejsLoad(path.resolve('foo', 'bar'))).toBe(path.resolve('foo', 'bar', 'index.json'));
  });

  it('load directory with package.json', () => {
    const fsConfig = {};
    fsConfig[path.join('foo', 'bar', 'package.json')] = '{"main": "lo.js"}';
    fsConfig[path.join('foo', 'bar', 'lo.js')] = 'bar/lo.js';
    mockfs(fsConfig);
    expect(Utils.nodejsLoad(path.resolve('foo', 'bar'))).toBe(path.resolve('foo', 'bar', 'lo.js'));
  });

  it('load directory with package.json, case2', () => {
    const fsConfig = {};
    fsConfig[path.join('foo', 'bar', 'package.json')] = '{"main": "lo.js"}';
    fsConfig[path.join('foo', 'bar', 'lo.js', 'index.js')] = 'bar/lo.js/index.js';
    mockfs(fsConfig);
    expect(Utils.nodejsLoad(path.resolve('foo', 'bar'))).toBe(path.resolve('foo', 'bar', 'lo.js', 'index.js'));
  });
});

describe('the Utils.removeJsExtension function', () => {
  it('keep other extension', () => {
    expect(Utils.removeJsExtension('a.html')).toBe('a.html');
    expect(Utils.removeJsExtension('c/d.css')).toBe('c/d.css');
    expect(Utils.removeJsExtension('c/d.min')).toBe('c/d.min');
  });
  it('strips .js extension', () => {
    expect(Utils.removeJsExtension('a.js')).toBe('a');
    expect(Utils.removeJsExtension('c/d.js')).toBe('c/d');
    expect(Utils.removeJsExtension('c/d.min.js')).toBe('c/d.min');
  });
});
