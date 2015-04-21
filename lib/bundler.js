var api = require('jspm/api');
var whacko = require('whacko');
var glob = require('glob');
var fs = require('fs');
var url = require('url');
var pluginName = 'view';

function bundleJS(configs) {
  configs.forEach(function(cfg) {
    api.bundle(cfg.moduleExpression, cfg.fileName, cfg.options);
  });
}


function bundleTemplate(pattern, config) {
  var templates = [];
  var outfile = 'build.html';

  glob
    .sync(pattern, {})
    .forEach(function(file) {
      var content = fs.readFileSync(file, {
        encoding: 'utf8'
      });
      var $ = whacko.load(content);
      var tid = getTemplateId(file, config);

      $('template').attr('id', tid);
      var template = $.html('template');
      templates.push(template);
    });

  fs.writeFileSync(outfile, templates.join('\n'));
}


function getTemplateId(file, config) {
  return getModuleName(config.baseURL + file, config);
}

function getModuleName(address, config) {

  // normalize address to ".js" if another extension plugin load
  if (pluginName) {
    var extension = address.split('/').pop();
    extension = extension.substr(extension.lastIndexOf('.'));
    if (extension != address && extension != '.js')
      address = address.substr(0, address.length - extension.length) + '.js';
  }

  // now just reverse apply paths rules to get canonical name
  var pathMatch, pathMatchLength = 0;
  var curMatchlength;
  for (var p in config.paths) {

    var curPath = decodeURI(url.resolve(encodeURI(config.baseURL), config.paths[p].replace(/\\/g, '/')));

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

  if (!pathMatch)
    throw "Unable to calculate path for " + address;

  if (pluginName)
    pathMatch += extension + '!' + (pluginName == extension ? '' : pluginName);

  return pathMatch;
}

module.exports = {
  bundleJS: bundleJS,
  bundleTemplate: bundleTemplate
}
