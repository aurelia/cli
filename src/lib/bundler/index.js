import jspm from 'jspm';
import whacko from 'whacko';
import glob from 'glob';
import fs from 'fs';
import url from 'url';
import path from 'path';
import * as log from '../logger';
import globby from 'globby';
import utils from 'systemjs-builder/lib/utils';
import { bundleJS } from './bundle';

// before calling any jspm api we should call the function bellow to set custom package path.
// jspm.setPackagePath('.');
// do we want to set custom set package path or baseURL? need discussion with @EisenbergEffect

export default function bundle(config, bundleOpts) {
  var jsConfig = config.js;
  var templateConfig = config.template;

  Object.keys(jsConfig)
    .forEach(function(key) {
      var cfg = jsConfig[key];
      var outfile = key + '.js';
      var moduleExpr = cfg.modules.join(' + ');
      var opt = cfg.options;
      bundleJS(moduleExpr, outfile, opt, bundleOpts);
    });

  if (!templateConfig) return;

  Object.keys(templateConfig)
    .forEach(function(key) {
      var cfg = templateConfig[key];
      var outfileName = key + '.html';
      var pattern = cfg.pattern;
      var options = cfg.options;
      bundleTemplate(pattern, outfileName, options, bundleOpts);
    });
}


function bundleTemplate(pattern, fileName, options, bundleOpts) {
  var templates = [];
  var builder = new jspm.Builder();
  var baseURL = builder.loader.baseURL;
  var cwd = utils.fromFileURL(baseURL);;
  var outfile = path.resolve(utils.fromFileURL(baseURL), fileName);

  if (fs.existsSync(outfile)) {
    if (!bundleOpts.force) {
      log.err('A bundle named `' + outfile + '` is already exists. Use --force to overwrite.');
      return;
    }
    fs.unlinkSync(outfile);
  }

  globby
    .sync(pattern, {
      cwd: cwd.replace(/\\/g, '/')
    })
    .forEach(function(file) {
      file = path.resolve(cwd, file);
      var content = fs.readFileSync(file, {
        encoding: 'utf8'
      });

      var $ = whacko.load(content);
      var name = getCanonicalName(builder, file, 'view');

      $('template').attr('id', name);
      var template = $.html('template');
      templates.push(template);
    });

  fs.writeFileSync(outfile, templates.join('\n'));

  if (options.inject) {
    injectLink(outfile, utils.fromFileURL(baseURL));
  }
}


function injectLink(outfile, baseURL) {
  var link = '';

  var bundle = path.resolve(baseURL, path.relative(baseURL, outfile));
  var index = path.resolve(baseURL, 'index.html');

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

function getCanonicalName(builder, file, pluginName) {
  return builder.getCanonicalName(utils.toFileURL(file) + '!' + pluginName);
}
