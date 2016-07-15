"use strict";
const os = require('os');
const path = require('path');
const SourceInclusion = require('./source-inclusion').SourceInclusion;

exports.DependencyInclusion = class {
  constructor(bundle, description) {
    this.bundle = bundle;
    this.description = description;
    this.items = [];
    this.traceDependencies = true;
    bundle.bundler.addFile(new DependencyFile(bundle, description), this);

    let loaderConfig = description.loaderConfig;
    let resources = loaderConfig.resources;

    if (resources) {
      resources.forEach(x => {
        let pattern = path.join(loaderConfig.path, x);
        let inclusion = new SourceInclusion(bundle, pattern);
        inclusion.addAllMatchingResources(loaderConfig);
        bundle.includes.push(inclusion);
      });
    }
  }

  addItem(item) {
    item.includedBy = this;
    item.includedIn = this.bundle;
    this.items.push(item);
  }

  trySubsume(item) {
    return false;
  }

  transform() {
    let index = -1;
    let items = this.items;

    function doTransform() {
      index++;

      if (index < items.length) {
        return items[index].transform().then(doTransform);
      }

      return Promise.resolve();
    }

    return doTransform();
  }

  getAllModuleIds() {
    return this.items.map(x => x.moduleId);
  }

  getAllFiles() {
    return this.items;
  }
}

class DependencyFile {
  constructor(bundle, description) {
    this.bundle = bundle;
    this.description = description;
    this._contents = null;
    this._path = null;
  }

  get path() {
    return this._path || (this._path = this.description.calculateMainPath(this.bundle.bundler.loaderConfig.baseUrl));
  }

  get contents() {
    return this._contents || (this._contents = this.description.readMainFileSync(this.bundle.bundler.loaderConfig.baseUrl));
  }
}
