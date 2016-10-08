"use strict";
const os = require("os");
const path = require("path");
const mapStream = require('./map-stream');
const BundledSource = require('./bundled-source').BundledSource;

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
	  this.excludes = this.bundle.excludes;
    this.items = [];
  }

  addItem(item) {
    item.includedBy = this;
    item.includedIn = this.bundle;
    this.items.push(item);
  }

  isExcluded(item){
	  let found = this.excludes.findIndex(exclusion => {			
			return exclusion.match(item.path);
		});
	  return found > -1;
  }
  
  trySubsume(item) {
    if (this.matcher.match(item.path) && !this.isExcluded(item)) {		
      item.includedBy = this;
      item.includedIn = this.bundle;
      this.items.push(item);
      return true;
    }

    return false;
  }

  addAllMatchingResources(loaderConfig) {
    return new Promise(resolve => {
      const vfs = require('vinyl-fs');

      let bundler = this.bundle.bundler;
      let root = path.resolve(bundler.project.paths.root, loaderConfig.path);
      let pattern = path.resolve(bundler.project.paths.root, this.pattern);

      var subsume = (file, cb) => {
        let filePath = file.path;
        let moduleId = path.join(loaderConfig.name, filePath.replace(root, ''));
        moduleId = moduleId.replace(/\\/g, '/');
        let ext = path.extname(moduleId);
        moduleId = moduleId.substring(0, moduleId.length - ext.length);

        let bundledSource = bundler.addFile(file, this);
        bundledSource.moduleId = moduleId;

        cb(null, file);
      };

      vfs.src(pattern).pipe(mapStream(subsume))
        .on('error', e => {
          console.log(`Error while adding all matching resources of pattern "${this.pattern}": ${e.message}`);
        })
        .on('end', resolve);
    });
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
