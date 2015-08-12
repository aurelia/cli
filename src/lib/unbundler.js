import jspm from 'jspm';
import Promise from 'bluebird';
import whacko from 'whacko';
import _ from 'lodash';
import fs from 'fs';
import utils from 'systemjs-builder/lib/utils';
import path from 'path';

export function unbundle(_opts) {
  let opts = _.defaultsDeep(_opts, {
    packagePath: '.',
    template: {}
  });

  jspm.setPackagePath(opts.packagePath);
  let builder = new jspm.Builder();

  let tasks = [removeJSBundle(opts), removeTemplateBundles(opts, builder)];
  return Promise.all(tasks);
}

function removeJSBundle(opts) {
  return jspm.unbundle();
}

function removeTemplateBundles(opts, builder) {

  let baseURL = utils.fromFileURL(builder.loader.baseURL);
  let tmplCfg = opts.template;
  let tasks = [];

  Object
    .keys(tmplCfg)
    .forEach((key) => {
      let cfg = tmplCfg[key];
      tasks.push(removeTemplateBundle(cfg.options, baseURL))
    });

  return Promise.all(tasks);
}

function removeTemplateBundle(options, _baseURL) {

  if(!options) Promise.resolve();

  let inject = options.inject;
  if(!inject) Promise.resolve();

  if(!_.isObject(inject)) inject = {};

  let cfg = _.defaults(inject, {
    indexFile: 'index.html',
    destFile: 'index.html'
  });


  let file = path.resolve(_baseURL, cfg.destFile);

  return Promise
    .promisify(fs.readFile)(file, {
      encoding: 'utf8'
    })
    .then((content) => {
      let $ = whacko.load(content);
      return Promise.resolve($);
    })
    .then(($) => {
      return removeLinkInjections($)
    })
    .then(($) => {
      return Promise.promisify(fs.writeFile)(file, $.html());
    });
}

function removeLinkInjections($) {
  $('link[aurelia-view-bundle]').remove();
  return Promise.resolve($);
}
