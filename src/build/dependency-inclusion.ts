import * as path from 'node:path';
import { SourceInclusion } from './source-inclusion';
import { minimatch } from 'minimatch';
import * as Utils from './utils';
import { Bundle } from './bundle';
import { getLogger } from 'aurelia-logging';
import { type DependencyDescription } from './dependency-description';
const logger = getLogger('DependencyInclusion');

const knownNonJsExtensions = ['.json', '.css', '.svg', '.html'];

export class DependencyInclusion {
  private bundle: Bundle;
  public description: DependencyDescription;
  private mainTraced: boolean;

  constructor(bundle: Bundle, description: DependencyDescription) {
    this.bundle = bundle;
    this.description = description;
    this.mainTraced = false;
  }

  traceMain() {
    if (this.mainTraced) return Promise.resolve();

    this.mainTraced = true;
    const mainId = this.description.mainId;
    const ext = path.extname(mainId).toLowerCase();
    const mainIsJs = !ext || knownNonJsExtensions.indexOf(ext) === -1;

    if (mainIsJs || ext === path.extname(this.description.name).toLowerCase()) {
      // only create alias when main is js file
      // or package name shares same extension (like normalize.css with main file normalize.css)
      this.bundle.addAlias(this.description.name, mainId);
    }

    let main = this.description.loaderConfig.main;
    if (mainIsJs && Utils.knownExtensions.indexOf(ext) === -1) {
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

    const loaderConfig = this.description.loaderConfig;
    const resources = loaderConfig.resources;

    if (resources) {
      resources.forEach(x => {
        work = work.then(() => this._tracePattern(x));
      });
    }

    return work;
  }

  traceResource(resource: string) {
    const resolved = resolvedResource(resource, this.description, this._getProjectRoot());

    if (!resolved) {
      logger.error(`Error: could not find "${resource}" in package ${this.description.name}`);
      return Promise.resolve();
    }

    if (Utils.removeJsExtension(resolved) !== Utils.removeJsExtension(resource)) {
      // alias bootstrap/css/bootstrap.css to bootstrap/lib/css/bootstrap.css
      this.bundle.addAlias(
        this.description.name + '/' + Utils.removeJsExtension(resource),
        this.description.name + '/' + Utils.removeJsExtension(resolved)
      );
    }

    const covered = this.bundle.includes.find(inclusion =>
      inclusion instanceof SourceInclusion &&
      inclusion.includedBy === this &&
      minimatch(resolved, inclusion.pattern)
    );

    if (covered) {
      return Promise.resolve();
    }

    return this._tracePattern(resolved);
  }

  _tracePattern(resource: string) {
    const loaderConfig = this.description.loaderConfig;
    const bundle = this.bundle;
    const pattern = path.join(loaderConfig.path, resource);
    const inclusion = new SourceInclusion(bundle, pattern, this);
    const promise = inclusion.addAllMatchingResources();
    bundle.includes.push(inclusion);
    bundle.requiresBuild = true;
    return promise;
  }

  // If all resources has same prefix like dist/type,
  // create conventional aliases like:
  // define('package/foo/bar', ['package/dist/type/foo/bar'], function(m) {return m;});
  conventionalAliases() {
    const ids: string[] = [];
    this.bundle.includes.forEach(inclusion => {
      if (inclusion instanceof SourceInclusion && inclusion.includedBy === this) {
        ids.push(...inclusion.getAllModuleIds());
      }
    });

    if (ids.length < 2) return {};

    const nameLength = this.description.name.length;

    const commonLen = commonLength(ids);
    if (!commonLen || commonLen <= nameLength + 1 ) return {};

    const aliases: {[key: string]: string} = {};
    ids.forEach(id => {
      // for aurelia-templating-resources/dist/commonjs/if
      // compact name is aurelia-templating-resources/if
      const compactResource = id.slice(commonLen);
      if (compactResource) {
        const compactId = this.description.name + '/' + compactResource;
        aliases[compactId] = id;
      }
    });

    return aliases;
  }

  trySubsume() {
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

function resolvedResource(resource: string, description: DependencyDescription, projectRoot: string) {
  const base = path.resolve(projectRoot, description.loaderConfig.path);
  const mainShift = description.loaderConfig.main.split('/');

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

    resolved = validResource(res, base);
    if (resolved) break;
  } while (mainShift.length);

  return resolved;
}

function validResource(resource: string, base: string) {
  const resourcePath = path.resolve(base, resource);
  const loaded = Utils.nodejsLoad(resourcePath);
  if (loaded) return path.relative(base, loaded).replace(/\\/g, '/');
}

function commonLength(ids: string[]) {
  const parts = ids[0].split('/');
  const rest = ids.slice(1);
  parts.pop(); // ignore last part

  let common = '';

  for (let i = 0, len = parts.length; i < len; i++) {
    const all = common + parts[i] + '/';
    if (rest.every(id => id.startsWith(all))) {
      common = all;
    } else {
      break;
    }
  }

  return common.length;
}
