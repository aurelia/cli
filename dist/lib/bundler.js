'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = bundle;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _jspmApi = require('jspm/api');

var _jspmApi2 = _interopRequireDefault(_jspmApi);

var _whacko = require('whacko');

var _whacko2 = _interopRequireDefault(_whacko);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var pluginName = 'view';

function bundleJS(moduleExpression, outfile, options) {
  _jspmApi2['default'].bundle(moduleExpression, outfile, options);
}

function bundle(config) {

  var loader = _jspmApi2['default'].Builder().loader;
  var baseURL = loader.baseURL;
  var paths = loader.paths;

  var jsConfig = config.js;
  var templateConfig = config.template;

  Object.keys(jsConfig).forEach(function (key) {
    var cfg = jsConfig[key];
    var outfile = key + '.js';
    var moduleExpr = cfg.modules.join(' + ');
    var opt = cfg.options;

    bundleJS(moduleExpr, outfile, opt);
  });

  Object.keys(templateConfig).forEach(function (key) {
    var cfg = templateConfig[key];
    var outfile = key + '.html';
    var pattern = cfg.pattern;
    var options = cfg.options;

    bundleTemplate(pattern, outfile, options, baseURL, paths);
  });
}

function bundleTemplate(pattern, outfile, options, baseURL, paths) {
  var templates = [];

  _glob2['default'].sync(pattern, {}).forEach(function (file) {
    var content = _fs2['default'].readFileSync(file, {
      encoding: 'utf8'
    });
    var $ = _whacko2['default'].load(content);
    var tid = getTemplateId(file, baseURL, paths);

    $('template').attr('id', tid);
    var template = $.html('template');
    templates.push(template);
  });

  _fs2['default'].writeFileSync(outfile, templates.join('\n'));

  if (options.inject) {
    injectLink(outfile, baseURL);
  }
}

function injectLink(outfile, baseURL) {
  var bu = baseURL.replace(/^file:/, '') + _path2['default'].sep;
  var content = _fs2['default'].readFileSync(bu + 'index.html', {
    encoding: 'utf8'
  });

  var $ = _whacko2['default'].load(content);

  $('head').append('<link aurlia-view-bundle rel="import" href="./' + outfile + '">');
}

function getTemplateId(file, baseURL, paths) {
  var bu = baseURL.replace(/\\/g, '/') + '/';
  var address = bu + file;

  return getModuleName(address, bu, paths);
}

function getModuleName(address, baseURL, paths) {
  var pathMatch,
      curMatchLength,
      curPath,
      wIndex,
      pathMatchLength = 0;

  if (pluginName) {
    var extension = address.split('/').pop();
    extension = extension.substr(extension.lastIndexOf('.'));
    if (extension != address && extension != '.js') address = address.substr(0, address.length - extension.length) + '.js';
  }

  for (var p in paths) {

    curPath = decodeURI(_url2['default'].resolve(encodeURI(baseURL), paths[p].replace(/\\/g, '/')));
    wIndex = curPath.indexOf('*');

    if (wIndex === -1) {
      if (address === curPath) {
        curMatchLength = curPath.split('/').length;
        if (curMatchLength > pathMatchLength) {
          pathMatch = p;
          pathMatchLength = curMatchLength;
        }
      }
    } else {
      if (address.substr(0, wIndex) === curPath.substr(0, wIndex) && address.substr(address.length - curPath.length + wIndex + 1) === curPath.substr(wIndex + 1)) {
        curMatchLength = curPath.split('/').length;
        if (curMatchLength > pathMatchLength) {
          pathMatch = p.replace('*', address.substr(wIndex, address.length - curPath.length + 1));
          pathMatchLength = curMatchLength;
        }
      }
    }
  }

  if (!pathMatch) throw 'Unable to calculate path for ' + address;

  if (pluginName) pathMatch += extension + '!' + (pluginName == extension ? '' : pluginName);

  return pathMatch;
}
module.exports = exports['default'];