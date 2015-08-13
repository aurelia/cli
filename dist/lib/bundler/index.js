'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = bundle;

var _jsBundler = require('./js-bundler');

var _templateBundler = require('./template-bundler');

function bundle(config) {
  var jsConfig = config.js;
  var templateConfig = config.template;

  _Object$keys(jsConfig).forEach(function (key) {
    var cfg = jsConfig[key];
    var outfile = key + '.js';
    var opt = cfg.options;

    opt.force = config.force;
    opt.packagePath = config.packagePath;

    (0, _jsBundler.bundleJS)(cfg.modules, outfile, opt);
  });

  if (!templateConfig) return;

  _Object$keys(templateConfig).forEach(function (key) {
    var cfg = templateConfig[key];
    var outfile = key + '.html';
    var pattern = cfg.pattern;
    var opt = cfg.options;

    opt.force = config.force;
    opt.packagePath = config.packagePath;

    (0, _templateBundler.bundleTemplate)(pattern, outfile, opt);
  });
}

module.exports = exports['default'];