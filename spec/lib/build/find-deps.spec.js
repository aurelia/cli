const fd = require('../../../lib/build/find-deps');
const findJsDeps = fd.findJsDeps;
const findHtmlDeps = fd.findHtmlDeps;
const findDeps = fd.findDeps;

let js = `
define(['./a', 'aurelia-pal', 'exports'], function(a,b,e){
  PLATFORM.moduleName('in1');
  p.PLATFORM
    .moduleName ( "/in2.js" );
  p.PLATFORM
    .moduleName ( "in1.js/foo.js" );
  foo.moduleName('nope');
  PLATFORM.bar('nope');
  PLATFORM.moduleName(NOPE);
  PLATFORM.moduleName('nope' + 4);
  PLATFORM.moduleName('$\{nope}');
  //duplicate
  PLATFORM.moduleName('in1');
});
`;
let jsDeps = ['./a', 'aurelia-pal', 'in1', 'in1.js/foo', 'in2.js'];

let html = `
  <template>
    <require from="a/b"></require>
    <require from="./c.html"></require>
    <import from="./from-import.html"></import>
    <div>
      <p>
        <REQUIRE from="d/e.css"></REQUIRE>
      </p>
    </div>

    <require from="no$\{pe}"></require>
    <require from.bind="nope"></require>
    <!-- <require from="nope"></require> -->

    <compose view-model="vm1" view.bind="nope"></compose>
    <div as-element="compose" view-model="vm2" view="v2"></div>

    <router-view layout-view-model="$\{nope}" layout-view="lv1"></router-view>
    <unknown as-element="router-view" layout-view-model="lvm2" layout-view="lv2"></unknown>
  </template>
`;
let htmlDeps = ['a/b', 'lv1', 'lv2', 'lvm2', 'text!./c.html', 'text!./from-import.html', 'text!d/e.css', 'v2', 'vm1', 'vm2'];
let htmlDepsSystemJS = ['./c.html!text', './from-import.html!text', 'a/b', 'd/e.css!text', 'lv1', 'lv2', 'lvm2', 'v2', 'vm1', 'vm2'];

let css = `
@import 'other.css';
.demo { color: blue; }
`;

describe('find-deps', () => {
  let mockfs;

  beforeEach(() => {
    mockfs = require('mock-fs');
    mockfs({});
  });

  afterEach(() => {
    mockfs.restore();
  });

  describe('findJsDeps', () => {
    it('finds js deps', () => {
      let contents =
        "define(['a', './b/c', 'exports', 'require', 'module'], function(a,b,e,r,m){return;})";

      expect(findJsDeps('ignore.js', contents).sort())
        .toEqual(['./b/c', 'a']);

      expect(findJsDeps('ignore.js', 'define(() => 1);').length).toBe(0);
    });

    it('finds aurelia PLATFORM.moduleName deps', () => {
      expect(findJsDeps('ignore.js', js).sort())
        .toEqual(jsDeps);
    });

    it('throws at syntax error', () => {
      expect(() => findJsDeps('ignore.js', 'define(func() {});')).toThrow();
    });

    it('finds plugins, but ignores plugin behind if condition', () => {
    /*
    import environment from './environment';
    import {PLATFORM} from 'aurelia-pal';

    export function configure(aurelia) {
      aurelia.use
        .feature('resources');
        .standardConfiguration();
        .plugin('p1')
        .developmentLogging(environment.debug ? 'debug' : 'warn');
      aurelia.use.plugin(PLATFORM.moduleName('pm'));
      aurelia.use.plugin('p2', {foo: 1});
      aurelia.use.plugin('p3', c => c.foo = 1);
      if (environment.testing) {
        aurelia.use.plugin('nope');
        aurelia.use.plugin('nope1', {foo: 1});
        aurelia.use.plugin('nope2', c => c.foo = 1);
      }
      aurelia.start().then(() => aurelia.setRoot());
    }
    */
      let file = `
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  var _environment = require('./environment');
  var _environment2 = _interopRequireDefault(_environment);
  var _aureliaPal = require('aurelia-pal');
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  function configure(aurelia) {
    aurelia.use.feature('resources').standardConfiguration().plugin('p1').developmentLogging(_environment2.default.debug ? 'debug' : 'warn');
    aurelia.use.plugin(_aureliaPal.PLATFORM.moduleName('pm'));
    aurelia.use.plugin('p2', { foo: 1 });
    aurelia.use.plugin('p3', function (c) {
      return c.foo = 1;
    });
    if (_environment2.default.testing) {
      aurelia.use.plugin('nope');
      aurelia.use.plugin('nope1', { foo: 1 });
      aurelia.use.plugin('nope2', function (c) {
        return c.foo = 1;
      });
    }
    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
  `;
      expect(findJsDeps('main.js', file).sort()).toEqual([
        'aurelia-event-aggregator',
        'aurelia-history-browser',
        'aurelia-logging-console',
        'aurelia-templating-binding',
        'aurelia-templating-resources',
        'aurelia-templating-router',
        'p1',
        'p2',
        'p3',
        'pm',
        'resources'
      ]);
    });

    it('finds plugins and global resources in configure, but ignores plugin behind if condition', () => {
    /*
    import {BcxService} from './bcx-service';
    import environment from '../environment';

    export function configure(config) {
      config.globalResources([
        PLATFORM.moduleName('./elements/x-y'),
        './binding-behaviors/z'
      ]);

      config.globalResources('./elements/a');

      config.plugin(PLATFORM.moduleName('ab'));

      config.plugin('p1');
      config.plugin('p2', {foo: 1})
        .plugin('p3', c => c.foo = 1);

      if (environment.testing) {
        config.plugin('nope');
        config.plugin('nope1', {foo: 1})
          .plugin('nope2', c => c.foo = 1);
      }
    }
    */
      let file = `
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  var _bcxService = require('./bcx-service');
  var _environment = require('../environment');
  var _environment2 = _interopRequireDefault(_environment);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  function configure(config) {
    config.globalResources([PLATFORM.moduleName('./elements/x-y'), './binding-behaviors/z']);
    config.globalResources('./elements/a');
    config.plugin(PLATFORM.moduleName('ab'));
    config.plugin('p1');
    config.plugin('p2', { foo: 1 }).plugin('p3', function (c) {
      return c.foo = 1;
    });
    if (_environment2.default.testing) {
      config.plugin('nope');
      config.plugin('nope1', { foo: 1 }).plugin('nope2', function (c) {
        return c.foo = 1;
      });
    }
  }
  `;
      expect(findJsDeps('index.js', file).sort()).toEqual([
        './binding-behaviors/z',
        './elements/a',
        './elements/x-y',
        'ab', 'p1', 'p2', 'p3']);
    });

    it('find deps on noView', () => {
    /*
    import {noView} from 'aurelia-framework';
    @noView(['a.css', './b.css'])
    export class MyComp {}
    */
      let file = `
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.MyComp = undefined;
  var _dec, _class;
  var _aureliaFramework = require('aurelia-framework');
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  var MyComp = exports.MyComp = (_dec = (0, _aureliaFramework.noView)(['a.css', './b.css']), _dec(_class = function MyComp() {
    _classCallCheck(this, MyComp);
  }) || _class);
  `;
      expect(findJsDeps('my-comp.js', file).sort()).toEqual(['text!./b.css', 'text!a.css']);
    });

    it('find deps on useView', () => {
    /*
    import {useView} from 'aurelia-framework';
    @useView('./a.html')
    export class MyComp {}
    */

      let file = `
  'use strict';
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.MyComp = undefined;
  var _dec, _class;
  var _aureliaFramework = require('aurelia-framework');
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  var MyComp = exports.MyComp = (_dec = (0, _aureliaFramework.useView)('./a.html'), _dec(_class = function MyComp() {
    _classCallCheck(this, MyComp);
  }) || _class);
  `;
      expect(findJsDeps('my-comp.js', file, 'system')).toEqual(['./a.html!text']);
    });

    it('find deps in inlineView html', () => {
    /*
    import {inlineView} from 'aurelia-framework';
    @inlineView('<template><require from="./a.css"></require></template>')
    export class MyComp {}
    */
      let file = `
  'use strict';
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.MyComp = undefined;
  var _dec, _class;
  var _aureliaFramework = require('aurelia-framework');
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  var MyComp = exports.MyComp = (_dec = (0, _aureliaFramework.inlineView)('<template><require from="./a.css"></require></template>'), _dec(_class = function MyComp() {
    _classCallCheck(this, MyComp);
  }) || _class);
  `;
      expect(findJsDeps('my-comp.js', file)).toEqual(['text!./a.css']);
    });

    it('find deps in inlineView html for TypeScript compiled code', () => {
    /*
    import {inlineView} from 'aurelia-framework';
    @inlineView('<template><require from="./a.css"></require></template>')
    export class MyComp {}
    */
      let file = `
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var aurelia_framework_1 = require('aurelia-framework');
var MyComp = (function () {
    function MyComp() {
    }
    MyComp = __decorate([
        aurelia_framework_1.inlineView('<template><require from="./a.css"></require></template>')
    ], MyComp);
    return MyComp;
})();
exports.MyComp = MyComp;
  `;
      expect(findJsDeps('my-comp.js', file)).toEqual(['text!./a.css']);
    });

    it('find deps in inlineView html, and additional deps', () => {
    /*
    import {inlineView} from 'aurelia-framework';
    import {PLATFORM} from 'aurelia-pal';
    @inlineView('<template><require from="./a.css"></require></template>', ['./b.css', PLATFORM.moduleName('./c.css')])
    export class MyComp {}
    */
      let file = `
  'use strict';
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.MyComp = undefined;
  var _dec, _class;
  var _aureliaFramework = require('aurelia-framework');
  var _aureliaPal = require('aurelia-pal');
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  var MyComp = exports.MyComp = (_dec = (0, _aureliaFramework.inlineView)('<template><require from="./a.css"></require></template>', ['./b.css', _aureliaPal.PLATFORM.moduleName('./c.css')]), _dec(_class = function MyComp() {
    _classCallCheck(this, MyComp);
  }) || _class);
  `;
      expect(findJsDeps('my-comp.js', file).sort()).toEqual(['text!./a.css', 'text!./b.css', 'text!./c.css']);
    });

    it('find html file by aurelia view convention', () => {
      const fsConfig = {};
      fsConfig['src/foo.html'] = 'contents';
      mockfs(fsConfig);
      expect(findJsDeps('src/foo.js', 'a();')).toEqual(['text!./foo.html']);
      expect(findJsDeps('src/foo.js', 'a();', 'system')).toEqual(['./foo.html!text']);
      expect(findDeps('src/foo.js', 'a();')).toEqual(['text!./foo.html']);
      expect(findDeps('src/foo.js', 'a();', 'system')).toEqual(['./foo.html!text']);
    });

    it('remove inner defined modules', () => {
      let file = `
define('M', function() {});
define('N', [], function() {});
define('another', ['M', 'N', 'a', 'b'], function() {});
      `;
      expect(findJsDeps('src/foo.js', file)).toEqual(['a', 'b']);
    });
  });

  describe('findHtmlDeps', () => {
    it('find all require deps', () => {
      expect(findHtmlDeps('ignore.html', html).sort())
        .toEqual(htmlDeps);

      expect(findHtmlDeps('ignore.html', html, 'system').sort())
        .toEqual(htmlDepsSystemJS);
    });

    it('silent at syntax error', () => {
      expect(findHtmlDeps('ignore.html', '</template>').length).toBe(0);
    });
  });

  describe('findDeps', () => {
    it('finds js deps', () => {
      expect(findDeps('ignore.js', js).sort())
        .toEqual(jsDeps);

      expect(findDeps('IGNORE.JS', js).sort())
        .toEqual(jsDeps);
    });

    it('finds html deps', () => {
      expect(findDeps('ignore.html', html).sort())
        .toEqual(htmlDeps);

      expect(findDeps('ignore.html', html, 'system').sort())
        .toEqual(htmlDepsSystemJS);

      expect(findDeps('IGNORE.HTM', html).sort())
        .toEqual(htmlDeps);

      expect(findDeps('IGNORE.HTM', html, 'system').sort())
        .toEqual(htmlDepsSystemJS);
    });

    it('passes other files', () => {
      expect(findDeps('ignore.css', css).length).toBe(0);
      expect(findDeps('IGNORE.CSS', css).length).toBe(0);
    });
  });
});
