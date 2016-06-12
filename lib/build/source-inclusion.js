"use strict";
const os = require("os");

exports.SourceInclusion = class {
  constructor(bundle, pattern) {
    this.bundle = bundle;
    this.orignalPattern = pattern;

    if (pattern[0] === '[' && pattern[pattern.length - 1] == ']') {
      this.traceDependencies = false;
      pattern = pattern.substring(1, pattern.length - 1);
    } else {
      this.traceDependencies = true;
    }

    this.pattern = pattern;
    this.matcher = this.bundle.createMatcher(pattern);
    this.items = [];
  }

  addItem(item) {
    item.includedBy = this;
    item.includedIn = this.bundle;
    this.items.push(item);
  }

  trySubsume(item) {
    if (this.matcher.match(item.path)) {
      item.includedBy = this;
      item.includedIn = this.bundle;
      this.items.push(item);
      return true;
    }

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
