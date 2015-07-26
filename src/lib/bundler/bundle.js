import jspm from 'jspm';
import config from 'jspm/lib/config';
import ui from 'jspm/lib/ui';
import { alphabetize } from 'jspm/lib/common';
import fs from 'fs';
import Promise from 'bluebird';
import Builder from 'systemjs-builder';
import { toFileURL, fromFileURL } from 'systemjs-builder/lib/utils';
import path from 'path';

ui.setResolver(this);
ui.useDefaults();

export function bundleJS(moduleExpression, fileName, opts, bundleOpts) {

  var systemBuilder = new Builder();
  config.loadSync();

  fileName = fileName || path.resolve(config.pjson.baseURL, 'build.js');

  if (!opts.sourceMaps) {
    removeExistingSourceMap(fileName);
  }

  ui.log('info', 'Building the bundle tree for `' + moduleExpression + '`...');

  // trace the starting module
  var cfg = config.loader.getConfig();
  cfg.baseURL = toFileURL(config.pjson.baseURL);

  var outfile = path.resolve(fromFileURL(cfg.baseURL), fileName);
  if (fs.existsSync(outfile)) {
    if (!bundleOpts.force) {
      ui.log('err', 'A bundle named `' + outfile + '` is already exists. Use --force to overwrite.');
      return;
    }
    fs.unlinkSync(outfile);
  }


  systemBuilder.config(cfg);
  return systemBuilder.trace(moduleExpression)
    .then(function(buildTree) {
      logTree(buildTree);
      if (!('lowResSourceMaps' in opts))
        opts.lowResSourceMaps = true;
      return systemBuilder.buildTree(buildTree, fileName, opts);
    })
    .then(function(output) {
      delete config.loader.depCache;

      if (opts.inject) {
        // Add the bundle to config if the inject flag was given.
        var bundleName = systemBuilder.getCanonicalName(toFileURL(path.resolve(config.pjson.baseURL, fileName)));

        if (!config.loader.bundles)
          config.loader.bundles = {};
        config.loader.bundles[bundleName] = output.modules;

        ui.log('ok', '`' + bundleName + '` added to config bundles.');
      }
    })
    .then(config.save)
    .then(function() {
      logBuild(path.relative(process.cwd(), fileName), opts);
    })
    .catch(function(e) {
      ui.log('err', e.stack || e);
      throw e;
    });
};

function logTree(tree) {
  ui.log('info', '');
  tree = alphabetize(tree);
  for (var name in tree)
    ui.log('info', '  `' + name + '`');
  ui.log('info', '');
}

function removeExistingSourceMap(fileName) {
  var sourceMapFile = fileName + '.map';
  if (fs.existsSync(sourceMapFile)) {
    fs.unlinkSync(sourceMapFile);
  }
}

function logBuild(outFile, opts) {
  var resolution = opts.lowResSourceMaps ? '' : 'high-res ';
  ui.log('ok', 'Built into `' + outFile + '`' +
    (opts.sourceMaps ? ' with ' + resolution + 'source maps' : '') + ', ' +
    (opts.minify ? '' : 'un') + 'minified' +
    (opts.minify ? (opts.mangle ? ', ' : ', un') + 'mangled.' : '.'));
}
