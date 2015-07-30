import jspm from 'jspm';
import whacko from 'whacko';
import fs from 'fs';
import path from 'path';
import * as log from '../logger';
import globby from 'globby';
import utils from 'systemjs-builder/lib/utils';

export function bundleTemplate(pattern, fileName, options, bundleOpts) {
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
    injectLink(outfile, utils.fromFileURL(baseURL), options.inject.indexFile);
  }
}


function injectLink(outfile, baseURL, fileName) {
  var link = '';
  var bundle = path.resolve(baseURL, path.relative(baseURL, outfile));

  var index = path.resolve(baseURL, fileName || 'index.html');
  var relpath = path.relative(path.dirname(index), path.dirname(bundle)).replace(/\\/g, '/');

  if (!relpath.startsWith('.')) {
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
