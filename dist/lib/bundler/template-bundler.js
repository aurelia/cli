'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

exports.bundleTemplate = bundleTemplate;

var _jspm = require('jspm');

var _jspm2 = _interopRequireDefault(_jspm);

var _whacko = require('whacko');

var _whacko2 = _interopRequireDefault(_whacko);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _logger = require('../logger');

var log = _interopRequireWildcard(_logger);

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _systemjsBuilderLibUtils = require('systemjs-builder/lib/utils');

var _systemjsBuilderLibUtils2 = _interopRequireDefault(_systemjsBuilderLibUtils);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function bundleTemplate(pattern, fileName, _opts) {
  var templates = [];

  var options = _lodash2['default'].defaultsDeep(_opts, {
    packagePath: '.'
  });

  _jspm2['default'].setPackagePath(options.packagePath);

  var builder = new _jspm2['default'].Builder();
  var baseURL = builder.loader.baseURL;
  var cwd = _systemjsBuilderLibUtils2['default'].fromFileURL(baseURL);;
  var outfile = _path2['default'].resolve(_systemjsBuilderLibUtils2['default'].fromFileURL(baseURL), fileName);

  if (_fs2['default'].existsSync(outfile)) {
    if (!options.force) {
      log.err('A bundle named `' + outfile + '` is already exists. Use --force to overwrite.');
      return;
    }
    _fs2['default'].unlinkSync(outfile);
  }

  _globby2['default'].sync(pattern, {
    cwd: cwd.replace(/\\/g, '/')
  }).forEach(function (file) {
    file = _path2['default'].resolve(cwd, file);
    var content = _fs2['default'].readFileSync(file, {
      encoding: 'utf8'
    });

    var $ = _whacko2['default'].load(content);
    var name = getCanonicalName(builder, file, 'view');

    $('template').attr('id', name);
    var template = $.html('template');
    templates.push(template);
  });

  _fs2['default'].writeFileSync(outfile, templates.join('\n'));

  if (options.inject) {
    injectLink(outfile, _systemjsBuilderLibUtils2['default'].fromFileURL(baseURL), options.inject);
  }
}

function injectLink(outfile, baseURL, injectOptions) {
  var link = '';
  var fileName = injectOptions.indexFile;
  var bundle = _path2['default'].resolve(baseURL, _path2['default'].relative(baseURL, outfile));
  var index = _path2['default'].resolve(baseURL, fileName || 'index.html');
  var destFile = injectOptions.destFile ? _path2['default'].resolve(baseURL, injectOptions.destFile) : index;

  var relpath = _path2['default'].relative(_path2['default'].dirname(index), _path2['default'].dirname(bundle)).replace(/\\/g, '/');

  if (!relpath.startsWith('.')) {
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

  _fs2['default'].writeFileSync(destFile, $.html());
}

function getCanonicalName(builder, file, pluginName) {
  return builder.getCanonicalName(_systemjsBuilderLibUtils2['default'].toFileURL(file) + '!' + pluginName);
}