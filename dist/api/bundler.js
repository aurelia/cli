'use strict';

var api = require('jspm/api');
var whacko = require('whacko');
var glob = require('glob');
var fs = require('fs');
var url = require('url');
var path = require('path');

var pluginName = 'view';
var loader = api.Builder().loader;

function bundleJS(moduleExpression, outfile, options) {
  api.bundle(moduleExpression, outfile, options);
}

function bundle(config) {

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

    bundleTemplate(pattern, outfile, options);
  });
}

function bundleTemplate(pattern, outfile, options) {
  var templates = [];

  glob.sync(pattern, {}).forEach(function (file) {
    var content = fs.readFileSync(file, {
      encoding: 'utf8'
    });
    var $ = whacko.load(content);
    var tid = getTemplateId(file);

    $('template').attr('id', tid);
    var template = $.html('template');
    templates.push(template);
  });

  fs.writeFileSync(outfile, templates.join('\n'));

  if (options.inject) {
    injectLink(outfile);
  }
}

function injectLink(outfile) {
  var baseURL = loader.baseURL.replace(/^file:/, '') + path.sep;
  var content = fs.readFileSync(baseURL + 'index.html', {
    encoding: 'utf8'
  });

  var $ = whacko.load(content);

  $('head').append('<link aurlia-view-bundle rel="import" href="./' + outfile + '">');
  fs.writeFileSync('text_index.html', $.html());
}

function getTemplateId(file) {
  var baseURL = loader.baseURL.replace(/\\/g, '/') + '/';
  var address = baseURL + file;
  return getModuleName(address, baseURL);
}

function getModuleName(address, baseURL) {

  var paths = loader.paths;

  if (pluginName) {
    var extension = address.split('/').pop();
    extension = extension.substr(extension.lastIndexOf('.'));
    if (extension != address && extension != '.js') address = address.substr(0, address.length - extension.length) + '.js';
  }

  var pathMatch,
      pathMatchLength = 0;
  var curMatchlength;
  for (var p in loader.paths) {

    var curPath = decodeURI(url.resolve(encodeURI(baseURL), paths[p].replace(/\\/g, '/')));

    var wIndex = curPath.indexOf('*');
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

module.exports = {
  bundleJS: bundleJS,
  bundleTemplate: bundleTemplate,
  bundle: bundle
};