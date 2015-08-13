'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

exports.unbundle = unbundle;

var _jspm = require('jspm');

var _jspm2 = _interopRequireDefault(_jspm);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _whacko = require('whacko');

var _whacko2 = _interopRequireDefault(_whacko);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _systemjsBuilderLibUtils = require('systemjs-builder/lib/utils');

var _systemjsBuilderLibUtils2 = _interopRequireDefault(_systemjsBuilderLibUtils);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function unbundle(_opts) {
  var opts = _lodash2['default'].defaultsDeep(_opts, {
    packagePath: '.',
    template: {}
  });

  _jspm2['default'].setPackagePath(opts.packagePath);
  var builder = new _jspm2['default'].Builder();

  var tasks = [removeJSBundle(opts), removeTemplateBundles(opts, builder)];
  return _bluebird2['default'].all(tasks);
}

function removeJSBundle(opts) {
  return _jspm2['default'].unbundle();
}

function removeTemplateBundles(opts, builder) {

  var baseURL = _systemjsBuilderLibUtils2['default'].fromFileURL(builder.loader.baseURL);
  var tmplCfg = opts.template;
  var tasks = [];

  _Object$keys(tmplCfg).forEach(function (key) {
    var cfg = tmplCfg[key];
    tasks.push(removeTemplateBundle(cfg.options, baseURL));
  });

  return _bluebird2['default'].all(tasks);
}

function removeTemplateBundle(options, _baseURL) {

  if (!options) _bluebird2['default'].resolve();

  var inject = options.inject;
  if (!inject) _bluebird2['default'].resolve();

  if (!_lodash2['default'].isObject(inject)) inject = {};

  var cfg = _lodash2['default'].defaults(inject, {
    indexFile: 'index.html',
    destFile: 'index.html'
  });

  var file = _path2['default'].resolve(_baseURL, cfg.destFile);

  return _bluebird2['default'].promisify(_fs2['default'].readFile)(file, {
    encoding: 'utf8'
  }).then(function (content) {
    var $ = _whacko2['default'].load(content);
    return _bluebird2['default'].resolve($);
  }).then(function ($) {
    return removeLinkInjections($);
  }).then(function ($) {
    return _bluebird2['default'].promisify(_fs2['default'].writeFile)(file, $.html());
  });
}

function removeLinkInjections($) {
  $('link[aurelia-view-bundle]').remove();
  return _bluebird2['default'].resolve($);
}