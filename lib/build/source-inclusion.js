const path = require('path');
const mapStream = require('map-stream');

exports.SourceInclusion = class {
  constructor(bundle, pattern, includedBy) {
    this.bundle = bundle;
    this.orignalPattern = pattern;
    // source-inclusion could be included by a dependency-inclusion
    this.includedBy = includedBy;

    if (pattern[0] === '[' && pattern[pattern.length - 1] === ']') {
      // strip "[**/*.js]" into "**/*.js"
      // this format is obsolete, but kept for backwards compatibility
      pattern = pattern.slice(1, -1);
    }

    this.pattern = pattern;
    this.matcher = this.bundle.createMatcher(pattern);
    this.excludes = this.bundle.excludes;
    this.items = [];

    this.vfs = require('vinyl-fs');
  }

  addItem(item) {
    item.includedBy = this;
    item.includedIn = this.bundle;
    this.items.push(item);
  }

  _isExcluded(item) {
    let found = this.excludes.findIndex(exclusion => {
      return exclusion.match(item.path);
    });
    return found > -1;
  }

  trySubsume(item) {
    if (this.matcher.match(item.path) && !this._isExcluded(item)) {
      this.addItem(item);
      return true;
    }

    return false;
  }

  addAllMatchingResources() {
    return new Promise((resolve, reject) => {
      let bundler = this.bundle.bundler;
      let pattern = path.resolve(this._getProjectRoot(), this.pattern);

      let subsume = (file, cb) => {
        bundler.addFile(file, this);
        cb(null, file);
      };

      this.vfs.src(pattern).pipe(mapStream(subsume))
        .on('error', e => {
          console.log(`Error while adding all matching resources of pattern "${this.pattern}": ${e.message}`);
          reject(e);
        })
        .on('end', resolve);
    });
  }

  _getProjectRoot() {
    return this.bundle.bundler.project.paths.root;
  }

  getAllModuleIds() {
    return this.items.map(x => x.moduleId);
  }

  getAllFiles() {
    return this.items;
  }
};
