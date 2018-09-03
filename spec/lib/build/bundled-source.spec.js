'use strict';
const path = require('path');
const BundlerMock = require('../../mocks/bundler');
const BundledSource = require('../../../lib/build/bundled-source').BundledSource;

const cwd = process.cwd();

describe('the BundledSource module', () => {
  let bundler;

  beforeEach(() => {
    bundler = new BundlerMock();
  });

  it('calculates moduleId for local js file', () => {
    let file = {
      path: path.resolve(cwd, 'src/foo/bar.js'),
      contents: 'some-content'
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';

    expect(bs.moduleId).toBe('foo/bar');
  });

  it('calculates moduleId for local js file above root level (src/)', () => {
    let file = {
      path: path.resolve(cwd, 'foo/bar.js'),
      contents: 'some-content'
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';

    expect(bs.moduleId).toBe('__dot_dot__/foo/bar');
  });

  it('calculates moduleId for local non-js file', () => {
    let file = {
      path: path.resolve(cwd, 'src/foo/bar.html'),
      contents: 'some-content'
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';

    expect(bs.moduleId).toBe('foo/bar.html');
  });

  it('calculates moduleId for npm package js file', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/bar/lo.js'),
      contents: 'some-content'
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs.includedBy = {
      includedBy: {
        description: {
          name: 'foo',
          mainId: 'foo/index',
          loaderConfig: {
            name: 'foo',
            path: '../node_modules/foo',
            main: 'index'
          }
        }
      }
    };

    expect(bs.moduleId).toBe('foo/bar/lo');
  });

  it('calculates moduleId for npm package non-js file', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/bar/lo.html'),
      contents: 'some-content'
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs.includedBy = {
      includedBy: {
        description: {
          name: 'foo',
          mainId: 'foo/index',
          loaderConfig: {
            name: 'foo',
            path: '../node_modules/foo',
            main: 'index'
          }
        }
      }
    };

    expect(bs.moduleId).toBe('foo/bar/lo.html');
  });

  it('transforms local js file', () => {
    let file = {
      path: path.resolve(cwd, 'src/foo/bar/loo.js'),
      contents: "define(['./a', 'lo/rem', 'text!./loo.html', 'text!foo.html'], function(a,r){});"
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({
      paths: {
        root: 'src',
        resources: 'resources',
        b8: 'foo/bar'
      }
    });

    let deps = bs.transform();
    expect(deps).toEqual(['lo/rem', 'foo.html']); // relative dep is ignored
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents).toBe("define('foo/bar/loo',['./a', 'lo/rem', 'text!./loo.html', 'text!foo.html'], function(a,r){});");
    expect(bundler.configTargetBundle.addAlias).toHaveBeenCalledWith('b8/loo', 'foo/bar/loo');
  });

  it('transforms local js file above root level (src/)', () => {
    let file = {
      path: path.resolve(cwd, '../shared/bar/loo.js'),
      contents: "define(['./a', 'lo/rem'], function(a,r){});"
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({
      paths: {
        root: 'src',
        resources: 'resources',
        shared: '../../shared'
      }
    });

    let deps = bs.transform();
    expect(deps).toEqual(['lo/rem']); // relative dep is ignored
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents).toBe("define('__dot_dot__/__dot_dot__/shared/bar/loo',['./a', 'lo/rem'], function(a,r){});");
    expect(bundler.configTargetBundle.addAlias).toHaveBeenCalledWith('shared/bar/loo', '__dot_dot__/__dot_dot__/shared/bar/loo');
  });


  it('transforms local non-js file', () => {
    let file = {
      path: path.resolve(cwd, 'src/foo/bar.html'),
      contents: '<template><require from="lo/rem.css"></require></template>'
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs._getLoaderPlugins = () => [{
      matches: modulePath => modulePath.endsWith('.html'),
      transform: (moduleId, modulePath, contents) => `define('${moduleId}',function(){return '${contents}';});`
    }];
    bs._getLoaderConfig = () => ({paths: {}});

    let deps = bs.transform();
    expect(deps).toEqual(['lo/rem.css']);
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents)
      .toBe("define('foo/bar.html',function(){return '<template><require from=\"lo/rem.css\"></require></template>';});");
  });

  it('transforms npm package js file', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/bar/lo.js'),
      contents: `
var t = require('./t');
exports.t = t;
`
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs.includedBy = {
      includedBy: {
        description: {
          name: 'foo',
          mainId: 'foo/index',
          loaderConfig: {
            name: 'foo',
            path: '../node_modules/foo',
            main: 'index'
          }
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});

    let deps = bs.transform();
    expect(deps).toEqual(['foo/bar/t']);
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents.replace(/\r|\n/g, ''))
      .toBe("define('foo/bar/lo',['require','exports','module','./t'],function (require, exports, module) {var t = require('./t');exports.t = t;});");
  });

  it('transforms npm package js file in native es module format', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/bar/lo.js'),
      contents: `
import t from './t';
export {t};
`
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs.includedBy = {
      includedBy: {
        description: {
          name: 'foo',
          mainId: 'foo/index',
          loaderConfig: {
            name: 'foo',
            path: '../node_modules/foo',
            main: 'index'
          }
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});

    let deps = bs.transform();
    expect(deps).toEqual(['foo/bar/t']);
    expect(bs.requiresTransform).toBe(false);
    // assume babel did right job for bs.contents
  });

  it('transforms npm package js file with named AMD module', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/index.js'),
      contents: "define('M', ['a', 'b'], function(){});\n"
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs.includedBy = {
      includedBy: {
        description: {
          name: 'foo',
          mainId: 'foo/index',
          loaderConfig: {
            name: 'foo',
            path: '../node_modules/foo',
            main: 'index'
          }
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});

    let deps = bs.transform();
    expect(deps).toEqual(['a', 'b']);
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents.replace(/\r|\n/g, ''))
      .toBe("define('M', ['a', 'b'], function(){});define(\"foo/index\", [\"M\"], function(m){return m;});");
  });

  it('transforms npm package js file with more than one named AMD module', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/index.js'),
      contents: "define('M', ['a', 'b'], function(){});define('N', ['c'], function(){});\n"
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs.includedBy = {
      includedBy: {
        description: {
          name: 'foo',
          mainId: 'foo/index',
          loaderConfig: {
            name: 'foo',
            path: '../node_modules/foo',
            main: 'index'
          }
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});

    let deps = bs.transform();
    expect(deps).toEqual(['a', 'b', 'c']);
    expect(bs.requiresTransform).toBe(false);
    // the alias targets first named module 'M'
    expect(bs.contents.replace(/\r|\n/g, ''))
      .toBe("define('M', ['a', 'b'], function(){});define('N', ['c'], function(){});define(\"foo/index\", [\"M\"], function(m){return m;});");
  });

  it('transforms npm package js file by force cjs wrapper', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/dist/cjs/lo.js'),
      contents: ''
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs.includedBy = {
      includedBy: {
        description: {
          name: 'foo',
          mainId: 'foo/dist/cjs/index',
          loaderConfig: {
            name: 'foo',
            path: '../node_modules/foo',
            main: 'dist/cjs/index'
          }
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});

    let deps = bs.transform();
    expect(deps).toBeUndefined();
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents.replace(/\r|\n/g, ''))
      .toBe("define('foo/dist/cjs/lo',['require','exports','module'],function (require, exports, module) {});");
  });

  it('transforms npm package json file', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/bar/lo.json'),
      contents: '{"a":1}'
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs.includedBy = {
      includedBy: {
        description: {
          name: 'foo',
          mainId: 'foo/index',
          loaderConfig: {
            name: 'foo',
            path: '../node_modules/foo',
            main: 'index'
          }
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});

    let deps = bs.transform();
    expect(deps).toBeUndefined();
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents)
      .toBe('define(\'foo/bar/lo.json\',[],function(){return JSON.parse("{\\\"a\\\":1}");});');
  });

  it('transforms npm package non-js file', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/bar/lo.html'),
      contents: '<template><require from="./a.css"></require></template>'
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs.includedBy = {
      includedBy: {
        description: {
          name: 'foo',
          mainId: 'foo/index',
          loaderConfig: {
            name: 'foo',
            path: '../node_modules/foo',
            main: 'index'
          }
        }
      }
    };
    bs._getLoaderPlugins = () => [{
      matches: modulePath => modulePath.endsWith('.html'),
      transform: (moduleId, modulePath, contents) => `define('${moduleId}',function(){return '${contents}';});`
    }];
    bs._getLoaderConfig = () => ({paths: {}});

    let deps = bs.transform();
    expect(deps).toEqual(['foo/bar/a.css']);
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents)
      .toBe("define('foo/bar/lo.html',function(){return '<template><require from=\"./a.css\"></require></template>';});");
  });

  it('transforms npm package legacy js file with shim', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/foo.js'),
      contents: 'var Foo = "Foo";'
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs.includedBy = {
      includedBy: {
        description: {
          name: 'foo',
          mainId: 'foo/foo',
          loaderConfig: {
            name: 'foo',
            path: '../node_modules/foo',
            main: 'foo',
            deps: ['bar'],
            'exports': 'Foo'
          }
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});

    let deps = bs.transform();
    expect(deps).toEqual(['bar']);
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents.replace(/\r|\n/g, ''))
      .toBe('var Foo = "Foo";define("foo/foo", ["bar"], (function (global) {  return function () {    return global.Foo;  };}(this)));');
  });

  it('transforms npm package js file in AMD/UMD format, ignoring shim in transform', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/foo.js'),
      contents: 'define(function(){});'
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs.includedBy = {
      includedBy: {
        description: {
          name: 'foo',
          mainId: 'foo/foo',
          loaderConfig: {
            name: 'foo',
            path: '../node_modules/foo',
            main: 'foo',
            deps: ['bar'],
            'exports': 'Foo'
          },
          browserReplacement: () => undefined
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});
    bs._getUseCache = () => undefined;

    let deps = bs.transform();
    expect(deps).toEqual(['bar']);
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents.replace(/\r|\n/g, ''))
      .toBe("define('foo/foo',[],function(){});");
  });

  it('transforms npm package legacy js file with shim but no exports', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/foo.js'),
      contents: 'var Foo = "Foo";'
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs.includedBy = {
      includedBy: {
        description: {
          name: 'foo',
          mainId: 'foo/foo',
          loaderConfig: {
            name: 'foo',
            path: '../node_modules/foo',
            main: 'foo',
            deps: ['bar']
          }
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});

    let deps = bs.transform();
    expect(deps).toEqual(['bar']);
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents.replace(/\r|\n/g, ''))
      .toBe('var Foo = "Foo";define("foo/foo", ["bar"], function(){});');
  });

  it('transforms npm package legacy js file with wrapShim', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/foo.js'),
      contents: 'var Foo = "Foo";'
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs.includedBy = {
      includedBy: {
        description: {
          name: 'foo',
          mainId: 'foo/foo',
          loaderConfig: {
            name: 'foo',
            path: '../node_modules/foo',
            main: 'foo',
            deps: ['bar'],
            'exports': 'Foo'
          }
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}, wrapShim: true});

    let deps = bs.transform();
    expect(deps).toEqual(['bar']);
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents.replace(/\r|\n/g, ''))
      .toBe('(function(root) {define("foo/foo", ["bar"], function() {  return (function() {var Foo = "Foo";return root.Foo = Foo;  }).apply(root, arguments);});}(this));');
  });

  it('transforms npm package legacy js file with per package wrapShim', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/foo.js'),
      contents: 'var Foo = "Foo";'
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs.includedBy = {
      includedBy: {
        description: {
          name: 'foo',
          mainId: 'foo/foo',
          loaderConfig: {
            name: 'foo',
            path: '../node_modules/foo',
            main: 'foo',
            deps: ['bar'],
            'exports': 'Foo',
            wrapShim: true
          }
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});

    let deps = bs.transform();
    expect(deps).toEqual(['bar']);
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents.replace(/\r|\n/g, ''))
      .toBe('(function(root) {define("foo/foo", ["bar"], function() {  return (function() {var Foo = "Foo";return root.Foo = Foo;  }).apply(root, arguments);});}(this));');
  });

  it('transforms npm package legacy js file with wrapShim but no exports', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/foo.js'),
      contents: 'var Foo = "Foo";'
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs.includedBy = {
      includedBy: {
        description: {
          name: 'foo',
          mainId: 'foo/foo',
          loaderConfig: {
            name: 'foo',
            path: '../node_modules/foo',
            main: 'foo',
            deps: ['bar']
          }
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}, wrapShim: true});

    let deps = bs.transform();
    expect(deps).toEqual(['bar']);
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents.replace(/\r|\n/g, ''))
      .toBe('(function(root) {define("foo/foo", ["bar"], function() {  return (function() {var Foo = "Foo";  }).apply(root, arguments);});}(this));');
  });
});
