import jspm from 'jspm';
import whacko from 'whacko';
import glob from 'glob';
import fs from 'fs';
import url from 'url';
import path from 'path';
import * as log from './logger';
import globby from 'globby';
import Builder from 'systemjs-builder';
import utils from 'systemjs-builder/lib/utils';

function bundleJS(moduleExpression, outfile, options) {
  return jspm.bundle(moduleExpression, outfile, options);
}

export default function bundle(config, bundleOpts) {

   var builder = new jspm.Builder();
   // configure baseURL here.


    builder.build('app', 'dist/outfile.js', {inject:true});
           


return;
  var loader = jspm.Builder().loader;
  var baseURL = loader.baseURL;
  var paths = loader.paths;
  var cleanBaseURL = baseURL.replace(/^file:/, '');

  var jsConfig = config.js;
  var templateConfig = config.template;

  Object.keys(jsConfig)
    .forEach(function(key) {
      var cfg = jsConfig[key];
      var outfile = key + '.js';

      let destPath = path.resolve(cleanBaseURL, outfile);
      var bundleName = getModuleId(destPath, baseURL, paths, '') + '.js';
      let bundlePath = path.resolve(cleanBaseURL, bundleName);

      if (fs.existsSync(destPath)) {
        if (!bundleOpts.force) {
          log.err('A bundle named "' + outfile + '" is already exists. Use --force to overwrite.');
          return;
        }
        fs.unlinkSync(outfile);
      }

      var moduleExpr = cfg.modules.join(' + ');
      var opt = cfg.options;

      bundleJS(moduleExpr, bundleName, opt)
        .then(function() {
          // move file to correct location
          if (destPath !== bundlePath) {
            fs.renameSync(bundlePath, destPath);
          }
        });
    });



  // template bundling
  return;
  if (!templateConfig) return;

  Object.keys(templateConfig)
    .forEach(function(key) {
      var cfg = templateConfig[key];
      var outfile = key + '.html';
      var pattern = cfg.pattern;
      var options = cfg.options;

      if (fs.existsSync(outfile)) {
        if (!bundleOpts.force) {
          log.err('A bundle named "' + outfile + '" is already exists. Use --force to overwrite.');
          return;
        }
        fs.unlinkSync(outfile);
      }

      bundleTemplate(pattern, outfile, options, baseURL, paths);
    });
}


function bundleTemplate(pattern, outfile, options, baseURL, paths) {
  var templates = [];
  var cwd = baseURL.replace(/^file:/, '');

  globby
    .sync(pattern, {
      cwd: cwd
    })
    .forEach(function(file) {

      file = path.resolve(cwd, file);

      var content = fs.readFileSync(file, {
        encoding: 'utf8'
      });
      var $ = whacko.load(content);
      var tid = getModuleId(file, baseURL, paths, 'view');

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

  if ($('link[aurelia-view-bundle][href="' + link + '"]').length === 0) {
    $('body').append('<link aurelia-view-bundle rel="import" href="' + link + '">');
  }

  fs.writeFileSync(index, $.html());
}


function getModuleId(file, baseURL, paths, pluginName) {
  var bu = baseURL.replace(/\\/g, '/') + '/';
  var address = 'file:' + file.replace(/\\/g, '/');
  return getModuleName(address, bu, paths, pluginName);
}
