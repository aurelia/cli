'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = bundle;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

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

var _logger = require('./logger');

var log = _interopRequireWildcard(_logger);

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

function bundleJS(moduleExpression, outfile, options) {
  return _jspmApi2['default'].bundle(moduleExpression, outfile, options);
}

function bundle(config, bundleOpts) {

  var loader = _jspmApi2['default'].Builder().loader;
  var baseURL = loader.baseURL;
  var paths = loader.paths;
  var cleanBaseURL = baseURL.replace(/^file:/, '');

  var jsConfig = config.js;
  var templateConfig = config.template;

  Object.keys(jsConfig).forEach(function (key) {
    var cfg = jsConfig[key];
    var outfile = key + '.js';

    var destPath = _path2['default'].resolve(cleanBaseURL, outfile);
    var bundleName = getModuleId(destPath, baseURL, paths, '') + '.js';
    var bundlePath = _path2['default'].resolve(cleanBaseURL, bundleName);

    if (_fs2['default'].existsSync(destPath)) {
      if (!bundleOpts.force) {
        log.err('A bundle named "' + outfile + '" is already exists. Use --force to overwrite.');
        return;
      }
      _fs2['default'].unlinkSync(outfile);
    }

    var moduleExpr = cfg.modules.join(' + ');
    var opt = cfg.options;

    bundleJS(moduleExpr, bundleName, opt).then(function () {
      // move file to correct location
      if (destPath !== bundlePath) {
        _fs2['default'].renameSync(bundlePath, destPath);
      }
    });
  });

  if (!templateConfig) return;

  Object.keys(templateConfig).forEach(function (key) {
    var cfg = templateConfig[key];
    var outfile = key + '.html';
    var pattern = cfg.pattern;
    var options = cfg.options;

    if (_fs2['default'].existsSync(outfile)) {
      if (!bundleOpts.force) {
        log.err('A bundle named "' + outfile + '" is already exists. Use --force to overwrite.');
        return;
      }
      _fs2['default'].unlinkSync(outfile);
    }

    bundleTemplate(pattern, outfile, options, baseURL, paths);
  });
}

function bundleTemplate(pattern, outfile, options, baseURL, paths) {
  var templates = [];
  var cwd = baseURL.replace(/^file:/, '');

  _globby2['default'].sync(pattern, {
    cwd: cwd
  }).forEach(function (file) {

    file = _path2['default'].resolve(cwd, file);

    var content = _fs2['default'].readFileSync(file, {
      encoding: 'utf8'
    });
    var $ = _whacko2['default'].load(content);
    var tid = getModuleId(file, baseURL, paths, 'view');

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
  var link = '';
  var bundle = _path2['default'].resolve(bu, _path2['default'].relative(bu, outfile));
  var index = _path2['default'].resolve(bu, 'index.html');

  var relpath = _path2['default'].relative(_path2['default'].dirname(index), _path2['default'].dirname(bundle)).replace(/\\/g, '/');

  //regex : !link.startsWith('.')
  if (!/^\./.test(relpath)) {
    link = relpath ? './' + relpath + '/' + _path2['default'].basename(bundle) : './' + _path2['default'].basename(bundle);
  } else {
    link = relpath + '/' + _path2['default'].basename(bundle);
  }

  var content = _fs2['default'].readFileSync(index, {
    encoding: 'utf8'
  });

  var $ = _whacko2['default'].load(content);

  if ($('link[aurelia-view-bundle][href="' + link + '"]').length === 0) {
    $('body').append('<link aurelia-view-bundle rel="import" href="' + link + '">');
  }

  _fs2['default'].writeFileSync(index, $.html());
}

function getModuleId(file, baseURL, paths, pluginName) {
  var bu = baseURL.replace(/\\/g, '/') + '/';
  var address = 'file:' + file.replace(/\\/g, '/');
  return getModuleName(address, bu, paths, pluginName);
}

function getModuleName(address, baseURL, paths, pluginName) {
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