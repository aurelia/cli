'use strict';
const path = require('path');
const SourceInclusion = require('./source-inclusion').SourceInclusion;
const minimatch = require('minimatch');
const fs = require('fs');
const logger = require('aurelia-logging').getLogger('DependencyInclusion');

const knownNonJsExtensions = ['.json', '.css', '.svg', '.html'];

exports.DependencyInclusion = class {
  constructor(bundle, description) {
    this.bundle = bundle;
    this.description = description;
    this.mainTraced = false;
  }

  traceMain() {
    if (this.mainTraced) return Promise.resolve();

    this.mainTraced = true;
    let mainId = this.description.mainId;
    let ext = path.extname(mainId).toLowerCase();
    let mainIsJs = !ext || knownNonJsExtensions.indexOf(ext) === -1;

    if (mainIsJs || ext === path.extname(this.description.name).toLowerCase()) {
      // only create alias when main is js file
      // or package name shares same extension (like normalize.css with main file normalize.css)
      this.bundle.addAlias(this.description.name, mainId);
    }

    let main = this.description.loaderConfig.main;
    if (mainIsJs) {
      main += '.js';
    }

    return this._tracePattern(main);
  }

  traceResources() {
    let work = Promise.resolve();
    // when user import from 'lodash/map',
    // only bundle node_modules/lodash/map.js,
    // without bundle node_modules/lodash/lodash.js,
    // which in addition trace and bundle everything.
    if (!this.description.loaderConfig.lazyMain) {
      work = work.then(() => this.traceMain());
    }

    let loaderConfig = this.description.loaderConfig;
    let resources = loaderConfig.resources;

    if (resources) {
      resources.forEach(x => {
        work = work.then(() => this._tracePattern(x));
      });
    }

    return work;
  }

  traceResource(resource) {
    let resolved = resolvedResource(resource, this.description, this._getProjectRoot());

    if (!resolved) {
      logger.error(`Error: could not find "${resource}" in package ${this.description.name}`);
      return Promise.resolve();
    }

    if (removeJsExtension(resolved) !== removeJsExtension(resource)) {
      // alias bootstrap/css/bootstrap.css to bootstrap/lib/css/bootstrap.css
      this.bundle.addAlias(
        this.description.name + '/' + removeJsExtension(resource),
        this.description.name + '/' + removeJsExtension(resolved)
      );
    }

    let covered = this.bundle.includes.find(inclusion =>
      inclusion.includedBy === this &&
      minimatch(resolved, inclusion.pattern)
    );

    if (covered) {
      return Promise.resolve();
    }

    return this._tracePattern(resolved);
  }

  _tracePattern(resource) {
    let loaderConfig = this.description.loaderConfig;
    let bundle = this.bundle;
    let pattern = path.join(loaderConfig.path, resource);
    let inclusion = new SourceInclusion(bundle, pattern, this);
    let promise = inclusion.addAllMatchingResources();
    bundle.includes.push(inclusion);
    bundle.requiresBuild = true;
    return promise;
  }

  // If all resources has same prefix like dist/type,
  // create conventional aliases like:
  // define('package/foo/bar', ['package/dist/type/foo/bar'], function(m) {return m;});
  conventionalAliases() {
    let ids = [];
    this.bundle.includes.forEach(inclusion => {
      if (inclusion.includedBy === this) {
        ids.push.apply(ids, inclusion.getAllModuleIds());
      }
    });

    if (ids.length < 2) return {};

    let nameLength = this.description.name.length;

    let commonLen = commonLength(ids);
    if (!commonLen || commonLen <= nameLength + 1 ) return {};

    let aliases = {};
    ids.forEach(id => {
      // for aurelia-templating-resources/dist/commonjs/if
      // compact name is aurelia-templating-resources/if
      let compactResource = id.substr(commonLen);
      if (compactResource) {
        let compactId = this.description.name + '/' + compactResource;
        aliases[compactId] = id;
      }
    });

    return aliases;
  }

  trySubsume(item) {
    return false;
  }

  getAllModuleIds() {
    // placeholder
    // all module ids are provided by source inclusion, including main module
    return [];
  }

  getAllFiles() {
    return []; // return this.items;
  }

  _getProjectRoot() {
    return this.bundle.bundler.project.paths.root;
  }
};

function resolvedResource(resource, description, projectRoot) {
  let mainShift = description.loaderConfig.main.split('/');

  // when mainShift is [dist,commonjs]
  // try  dist/commonjs/resource first
  // then dist/resource
  // then resource
  let resolved;

  do {
    mainShift.pop();
    let res;
    if (mainShift.length) {
      res = mainShift.join('/') + '/' + resource;
    } else {
      res = resource;
    }

    resolved = validResource(res, description, projectRoot);
    if (resolved) break;
  } while (mainShift.length);

  return resolved;
}

function validResource(resource, description, projectRoot) {
  const resExtname = path.extname(resource).toLowerCase();
  const base = description.loaderConfig.path;

  if (!resExtname || knownNonJsExtensions.indexOf(resExtname) === -1) {
    // when resource is foo/bar
    // nodejs will try node_modules/foo/bar.js first, then node_modules/foo/bar/index.js
    const directRef = resource + '.js';
    const indexRef = resource + '/index.js';

    if (fs.existsSync(path.resolve(projectRoot, base, directRef))) {
      return directRef;
    } else if (fs.existsSync(path.resolve(projectRoot, base, indexRef))) {
      return indexRef;
    }
  }

  if (fs.existsSync(path.resolve(projectRoot, base, resource))) {
    return resource;
  }
}

function removeJsExtension(filePath) {
  if (path.extname(filePath).toLowerCase() === '.js') {
    return filePath.substr(0, filePath.length - 3);
  }

  return filePath;
}

function commonLength(ids) {
  let parts = ids[0].split('/');
  let rest = ids.slice(1);
  parts.pop(); // ignore last part

  let common = '';

  for (let i = 0, len = parts.length; i < len; i++) {
    let all = common + parts[i] + '/';
    if (rest.every(id => id.startsWith(all))) {
      common = all;
    } else {
      break;
    }
  }

  return common.length;
}
