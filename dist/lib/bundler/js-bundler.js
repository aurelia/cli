'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

exports.bundleJS = bundleJS;

var _jspm = require('jspm');

var _jspm2 = _interopRequireDefault(_jspm);

var _jspmLibConfig = require('jspm/lib/config');

var _jspmLibConfig2 = _interopRequireDefault(_jspmLibConfig);

var _jspmLibUi = require('jspm/lib/ui');

var _jspmLibUi2 = _interopRequireDefault(_jspmLibUi);

var _jspmLibCommon = require('jspm/lib/common');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _systemjsBuilderLibUtils = require('systemjs-builder/lib/utils');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function bundleJS(modules, fileName, _opts) {

  _jspmLibUi2['default'].setResolver(this);
  _jspmLibUi2['default'].useDefaults();

  var opts = _lodash2['default'].defaultsDeep(_opts, {
    packagePath: '.'
  });

  _jspm2['default'].setPackagePath(opts.packagePath);

  var builder = new _jspm2['default'].Builder();
  var outfile = _path2['default'].resolve((0, _systemjsBuilderLibUtils.fromFileURL)(builder.loader.baseURL), fileName);

  if (!opts.sourceMaps) {
    removeExistingSourceMap(outfile);
  }

  if (_fs2['default'].existsSync(outfile)) {
    if (!opts.force) {
      _jspmLibUi2['default'].log('err', 'A bundle named `' + outfile + '` is already exists. Use --force to overwrite.');
      return;
    }
    _fs2['default'].unlinkSync(outfile);
  }

  var moduleExpression = modules.map(function (m) {
    return getFullModuleName(m, _jspmLibConfig2['default'].loader.__originalConfig.map);
  }).join(' + ');

  return builder.trace(moduleExpression).then(function (buildTree) {
    logTree(buildTree);
    if (!('lowResSourceMaps' in opts)) opts.lowResSourceMaps = true;
    return builder.buildTree(buildTree, outfile, opts);
  }).then(function (output) {
    delete _jspmLibConfig2['default'].loader.depCache;
    if (opts.inject) injectBundle(builder, fileName, output);
  }).then(_jspmLibConfig2['default'].save).then(function () {
    logBuild(outfile, opts);
  })['catch'](function (e) {
    _jspmLibUi2['default'].log('err', e.stack || e);
    throw e;
  });
}

;

function injectBundle(builder, fileName, output) {
  var bundleName = builder.getCanonicalName((0, _systemjsBuilderLibUtils.toFileURL)(_path2['default'].resolve(_jspmLibConfig2['default'].pjson.baseURL, fileName)));
  if (!_jspmLibConfig2['default'].loader.bundles) {
    _jspmLibConfig2['default'].loader.bundles = {};
  }
  _jspmLibConfig2['default'].loader.bundles[bundleName] = output.modules;
  _jspmLibUi2['default'].log('ok', '`' + bundleName + '` added to config bundles.');
}

function logTree(tree) {
  _jspmLibUi2['default'].log('info', '');
  tree = (0, _jspmLibCommon.alphabetize)(tree);
  for (var name in tree) _jspmLibUi2['default'].log('info', '  `' + name + '`');
  _jspmLibUi2['default'].log('info', '');
}

function logModules(modules) {
  _jspmLibUi2['default'].log('info', '');
  modules.forEach(function (m) {
    _jspmLibUi2['default'].log('info', '  `' + m + '`');
  });
  _jspmLibUi2['default'].log('info', '');
}

function removeExistingSourceMap(outfile) {
  var mapFile = outfile + '.map';
  if (_fs2['default'].existsSync(mapFile)) {
    _fs2['default'].unlinkSync(mapFile);
  }
}

function logBuild(outFile, opts) {
  var resolution = opts.lowResSourceMaps ? '' : 'high-res ';
  _jspmLibUi2['default'].log('ok', 'Built into `' + outFile + '`' + (opts.sourceMaps ? ' with ' + resolution + 'source maps' : '') + ', ' + (opts.minify ? '' : 'un') + 'minified' + (opts.minify ? (opts.mangle ? ', ' : ', un') + 'mangled.' : '.'));
}

function getFullModuleName(moduleName, map) {
  var matches = [];

  _Object$keys(map).forEach(function (m) {
    if (m.startsWith(moduleName)) {
      matches.push(m);
    }
  });

  if (matches.length === 0) {
    return moduleName;
  }

  if (matches.length > 1) {
    _jspmLibUi2['default'].log('err', 'Multiple matches found for module: \'' + moduleName + '\'. Matches are:');
    logModules(matches);
    _jspmLibUi2['default'].log('info', 'Try including a specific version number or resolve the conflict manually with jspm');
    throw 'Version conflict found in module names specified in `aureliafile`';
  }

  return matches[0];
}