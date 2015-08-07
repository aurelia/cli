import jspm from 'jspm';
import whacko from 'whacko';
import fs from 'fs';
import path from 'path';
import * as log from '../logger';
import globby from 'globby';
import utils from 'systemjs-builder/lib/utils';

export function bundleTemplate(pattern, fileName, options, bundleOpts) {
  let templates = [];
  let builder = new jspm.Builder();
  let baseURL = builder.loader.baseURL;
  let cwd = utils.fromFileURL(baseURL);;
  let outfile = path.resolve(utils.fromFileURL(baseURL), fileName);

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
    .forEach((file) => {
      file = path.resolve(cwd, file);
      let content = fs.readFileSync(file, {
        encoding: 'utf8'
      });

      let $ = whacko.load(content);
      let name = getCanonicalName(builder, file, 'view');

      $('template').attr('id', name);
      var template = $.html('template');
      templates.push(template);
    });

  fs.writeFileSync(outfile, templates.join('\n'));

  if (options.inject) {
    inject(outfile, utils.fromFileURL(baseURL), options.inject);
  }
}


function inject(outfile, baseURL, injectOptions) {
  let bundleName = getCanonicalName(outfile);
  // get config.js
  // parse it
  // create and array of bundled moduleNames, 
  // Create a section for System.config({}) for template bundles
}

function getCanonicalName(builder, file, pluginName) {
  return builder.getCanonicalName(utils.toFileURL(file) + '!' + pluginName);
}
