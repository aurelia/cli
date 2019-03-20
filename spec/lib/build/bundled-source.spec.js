const path = require('path');
const BundlerMock = require('../../mocks/bundler');
const BundledSource = require('../../../lib/build/bundled-source').BundledSource;
const Utils = require('../../../lib/build/utils');

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
          },
          browserReplacement: () => undefined
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
          },
          browserReplacement: () => undefined
        }
      }
    };

    expect(bs.moduleId).toBe('foo/bar/lo.html');
  });

  it('transforms local js file', () => {
    let file = {
      path: path.resolve(cwd, 'src/foo/bar/loo.js'),
      contents: "define(['./a', 'lo/rem', 'text!./loo.yaml', 'text!foo.html', 'some/plugin!bar.html'], function(a,r){});"
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
    bs._getUseCache = () => undefined;

    let deps = bs.transform();
    expect(deps.sort()).toEqual(['bar.html', 'foo.html', 'foo/bar/loo.yaml', 'lo/rem', 'some/plugin']); // relative dep is ignored
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents).toBe("define('foo/bar/loo',['./a', 'lo/rem', 'text!./loo.yaml', 'text!foo.html', 'some/plugin!bar.html'], function(a,r){});");
    expect(bundler.configTargetBundle.addAlias).toHaveBeenCalledWith('b8/loo', 'foo/bar/loo');
  });

  it('transforms local js file with css injection', () => {
    let file = {
      path: path.resolve(cwd, 'src/foo.js'),
      contents: "define(['./foo.css', 'bar'], function(c,b){});"
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({
      paths: {
        root: 'src',
        resources: 'resources'
      }
    });
    bs._getUseCache = () => undefined;

    let deps = bs.transform();
    expect(deps).toEqual(['bar', '__inject_css__']); // relative dep is ignored
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents).toBe(`define('foo',['./foo.css', 'bar'], function(c,b){});
define('foo.css',['__inject_css__','text!foo.css'],function(i,c){i(c,'_au_css:foo.css');});
`);
  });

  it('transforms local js file with inlineView with css dep', () => {
    let file = {
      path: path.resolve(cwd, 'src/foo.js'),
      contents: 'define([\'au\'], function(au){au.inlineView(\'<template><require from="foo.css"></require></template>\', [\'bar.css\', \'./a.css\']);});'
    };

    let bs = new BundledSource(bundler, file);
    bs._getProjectRoot = () => 'src';
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({
      paths: {
        root: 'src',
        resources: 'resources'
      }
    });
    bs._getUseCache = () => undefined;

    let deps = bs.transform();
    expect(deps).toEqual(['au', 'bar.css', 'foo.css']); // relative dep is ignored, text! prefix is stripped
    expect(bs.requiresTransform).toBe(false);
    // doesn't call DOM.injectStyles for inlineView css
    expect(bs.contents).toBe('define(\'foo\',[\'au\'], function(au){au.inlineView(\'<template><require from="foo.css"></require></template>\', [\'bar.css\', \'./a.css\']);});');
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
    bs._getUseCache = () => undefined;

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
    bs._getUseCache = () => undefined;

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
          },
          browserReplacement: () => undefined
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});
    bs._getUseCache = () => undefined;

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
          },
          browserReplacement: () => undefined
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});
    bs._getUseCache = () => undefined;

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
          },
          browserReplacement: () => undefined
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});
    bs._getUseCache = () => undefined;

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
          },
          browserReplacement: () => undefined
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});
    bs._getUseCache = () => undefined;

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
          },
          browserReplacement: () => undefined
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});
    bs._getUseCache = () => undefined;

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
          },
          browserReplacement: () => undefined
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});
    bs._getUseCache = () => undefined;

    let deps = bs.transform();
    expect(deps).toBeUndefined();
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents)
      .toBe('define(\'text!foo/bar/lo.json\',[],function(){return "{\\\"a\\\":1}";});\ndefine(\'foo/bar/lo.json\',[\'text!foo/bar/lo.json\'],function(m){return JSON.parse(m);});\ndefine(\'json!foo/bar/lo.json\',[\'foo/bar/lo.json\'],function(m){return m;});\n');
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
          },
          browserReplacement: () => undefined
        }
      }
    };
    bs._getLoaderPlugins = () => [{
      matches: modulePath => modulePath.endsWith('.html'),
      transform: (moduleId, modulePath, contents) => `define('${moduleId}',function(){return '${contents}';});`
    }];
    bs._getLoaderConfig = () => ({paths: {}});
    bs._getUseCache = () => undefined;

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
          },
          browserReplacement: () => undefined
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}, wrapShim: true});
    bs._getUseCache = () => undefined;

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
          },
          browserReplacement: () => undefined
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}, wrapShim: true});
    bs._getUseCache = () => undefined;

    let deps = bs.transform();
    expect(deps).toEqual(['bar']);
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents.replace(/\r|\n/g, ''))
      .toBe('(function(root) {define("foo/foo", ["bar"], function() {  return (function() {var Foo = "Foo";  }).apply(root, arguments);});}(this));');
  });

  it('transforms npm package js file with browser replacement dep', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/index.js'),
      contents: "require('module-a'); require(\"module-b\"); require('./bar/'); require('prebid.js'); require('./server/only.js/');"
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
          },
          browserReplacement: () => ({
            'module-a': false,
            'module-b': './shims/module/b',
            './server/only': './shims/server-only'
          })
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});
    bs._getUseCache = () => undefined;

    let deps = bs.transform();
    expect(deps).toEqual(['__ignore__', 'foo/shims/module/b', 'foo/bar', 'prebid.js', 'foo/shims/server-only']);
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents.replace(/\r|\n/g, ''))
      .toBe("define('foo/index',['require','exports','module','__ignore__','./shims/module/b','./bar','prebid.js','./shims/server-only'],function (require, exports, module) {require('__ignore__'); require('./shims/module/b'); require('./bar'); require('prebid.js'); require('./shims/server-only');});");
  });

  it('transforms clears up deps with ".js" and "/" ending', () => {
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/index.js'),
      contents: "require('pack-name.js'); require('@pack/name.js'); require('pack-name.js/foo.js'); require('@pack/name.js/foo.js'); require('./bar.js/');"
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
          },
          browserReplacement: () => undefined
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});
    bs._getUseCache = () => undefined;

    let deps = bs.transform();
    expect(deps).toEqual(['pack-name.js', '@pack/name.js', 'pack-name.js/foo', '@pack/name.js/foo', 'foo/bar']);
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents.replace(/\r|\n/g, ''))
      .toBe("define('foo/index',['require','exports','module','pack-name.js','@pack/name.js','pack-name.js/foo','@pack/name.js/foo','./bar'],function (require, exports, module) {require('pack-name.js'); require('@pack/name.js'); require('pack-name.js/foo'); require('@pack/name.js/foo'); require('./bar');});");
  });

  it('does not clears up deps with ".js" for browserify umd build', () => {
    const umd = `(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.foo = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = 'bar';

},{}],2:[function(require,module,exports){
module.exports = require('./bar.js');
},{"./bar.js":1}]},{},[2])(2)
});
`;
    let file = {
      path: path.resolve(cwd, 'node_modules/foo/index.js'),
      contents: umd
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
          },
          browserReplacement: () => undefined
        }
      }
    };
    bs._getLoaderPlugins = () => [];
    bs._getLoaderConfig = () => ({paths: {}});
    bs._getUseCache = () => undefined;

    let deps = bs.transform();
    expect(deps).toBeUndefined();
    expect(bs.requiresTransform).toBe(false);
    expect(bs.contents).toContain("define('foo/index',[]");
    expect(bs.contents).toContain("require('./bar.js')");
  });


  describe('cache', () => {
    let oldGetCache;
    let oldSetCache;

    beforeEach(() => {
      oldGetCache = Utils.getCache;
      oldSetCache = Utils.setCache;
    });

    afterEach(() => {
      Utils.getCache = oldGetCache;
      Utils.setCache = oldSetCache;
    });

    it('transform saves cache', () => {
      let file = {
        path: path.resolve(cwd, 'node_modules/foo/bar/lo.js'),
        contents: "var t = require('./t');exports.t = t;"
      };

      Utils.getCache = jasmine.createSpy('getCache').and.returnValue(undefined);
      Utils.setCache = jasmine.createSpy('setCache');

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
            },
            browserReplacement: () => undefined
          }
        }
      };
      bs._getLoaderPlugins = () => [];
      bs._getLoaderConfig = () => ({paths: {}});
      bs._getUseCache = () => true;

      let deps = bs.transform();
      let contents = "define('foo/bar/lo',['require','exports','module','./t'],function (require, exports, module) {var t = require('./t');exports.t = t;});";
      expect(deps).toEqual(['foo/bar/t']);
      expect(bs.requiresTransform).toBe(false);
      expect(bs.contents.replace(/\r|\n/g, ''))
        .toBe(contents);

      expect(Utils.getCache).toHaveBeenCalled();
      expect(Utils.setCache).toHaveBeenCalled();
      expect(Utils.setCache.calls.argsFor(0)[1].deps).toEqual(['./t']);
      expect(Utils.setCache.calls.argsFor(0)[1].contents.replace(/\r|\n/g, '')).toBe(contents);
    });

    it('transform uses cache', () => {
      let file = {
        path: path.resolve(cwd, 'node_modules/foo/bar/lo.js'),
        contents: "var t = require('./t');exports.t = t;"
      };

      let contents = "define('foo/bar/lo',['require','exports','module','./t'],function (require, exports, module) {var t = require('./t');exports.t = t;});";

      Utils.getCache = jasmine.createSpy('getCache').and.returnValue({
        deps: ['./t'],
        contents
      });
      Utils.setCache = jasmine.createSpy('setCache');

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
            },
            browserReplacement: () => undefined
          }
        }
      };
      bs._getLoaderPlugins = () => [];
      bs._getLoaderConfig = () => ({paths: {}});
      bs._getUseCache = () => true;

      let deps = bs.transform();
      expect(deps).toEqual(['foo/bar/t']);
      expect(bs.requiresTransform).toBe(false);
      expect(bs.contents.replace(/\r|\n/g, ''))
        .toBe(contents);

      expect(Utils.getCache).toHaveBeenCalled();
      expect(Utils.setCache).not.toHaveBeenCalled();
    });
  });
});
