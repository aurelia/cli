import api from 'jspm/api';
import whacko from 'whacko';
import glob from 'glob';
import fs from 'fs';
import url from 'url';
import path from 'path';

var pluginName = 'view';

function bundleJS(moduleExpression, outfile, options) {
  api.bundle(moduleExpression, outfile, options);
}

export default function bundle(config) {

  var loader = api.Builder().loader;
  var baseURL = loader.baseURL;
  var paths = loader.paths;

  var jsConfig = config.js;
  var templateConfig = config.template;

  Object.keys(jsConfig)
    .forEach(function(key) {
      var cfg = jsConfig[key];
      var outfile = key + '.js';
      var moduleExpr = cfg.modules.join(' + ');
      var opt = cfg.options;

      bundleJS(moduleExpr, outfile, opt);
    });

  if (!templateConfig) return;

  Object.keys(templateConfig)
    .forEach(function(key) {
      var cfg = templateConfig[key];
      var outfile = key + '.html';
      var pattern = cfg.pattern;
      var options = cfg.options;

      bundleTemplate(pattern, outfile, options, baseURL, paths);
    });
}


function bundleTemplate(pattern, outfile, options, baseURL, paths) {
  var templates = [];
  var cwd = baseURL.replace(/^file:/, '');

    glob
      .sync(pattern, {
        cwd: cwd
      })
      .forEach(function(file) {

        file = path.resolve(cwd, file);

        var content = fs.readFileSync(file, {
          encoding: 'utf8'
        });
        var $ = whacko.load(content);
        var tid = getTemplateId(file, baseURL, paths);

        $('template').attr('id', tid);
        var template = $.html('template');
        templates.push(template);
      });

    fs.writeFileSync(outfile, templates.join('\n'));

  if (options.inject) {
    injectLink(outfile, baseURL);
  }
}

function injectLink(outfile, baseURL) {
  var bu = baseURL.replace(/^file:/, '') + path.sep;
  var link = '';
  var bundle = path.resolve(bu, path.relative(bu, outfile));
  var index = path.resolve(bu, 'index.html');

  var relpath = path.relative(path.dirname(index), path.dirname(bundle)).replace(/\\/g, '/');

  //regex : !link.startsWith('.')
  if (!(/^\./.test(relpath))) {
    link = relpath ? './' + relpath + '/' + path.basename(bundle) : './' + path.basename(bundle);
  } else {
    link = relpath + '/' + path.basename(bundle);
  }

  var content = fs.readFileSync(index, {
    encoding: 'utf8'
  });

  var $ = whacko.load(content);

  if($('link[aurelia-view-bundle][href="'+ link +'"]').length === 0 ){
    $('body').append('<link aurelia-view-bundle rel="import" href="' + link + '">');
  }

  fs.writeFileSync(index, $.html());
}


function getTemplateId(file, baseURL, paths) {
  var bu = baseURL.replace(/\\/g, '/') + '/';
  var address = 'file:' + file.replace(/\\/g, '/');
  return getModuleName(address, bu, paths);
}

function getModuleName(address, baseURL, paths) {
  var pathMatch, curMatchLength, curPath, wIndex, pathMatchLength = 0;

  if (pluginName) {
    var extension = address.split('/').pop();
    extension = extension.substr(extension.lastIndexOf('.'));
    if (extension != address && extension != '.js')
      address = address.substr(0, address.length - extension.length) + '.js';
  }


  for (var p in paths) {

    curPath = decodeURI(url.resolve(encodeURI(baseURL), paths[p].replace(/\\/g, '/')));
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

  if (!pathMatch)
    throw "Unable to calculate path for " + address;

  if (pluginName)
    pathMatch += extension + '!' + (pluginName == extension ? '' : pluginName);

  return pathMatch;
}
