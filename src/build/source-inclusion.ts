import * as path from 'node:path';
import mapStream from 'map-stream';
import { type Bundle } from './bundle';
import { type Minimatch } from 'minimatch';
import { BundledSource } from './bundled-source';
import { DependencyInclusion } from './dependency-inclusion';
import * as vfs from 'vinyl-fs';

export class SourceInclusion {
  public bundle: Bundle;
  private orignalPattern: string;
  public includedBy: DependencyInclusion;
  public readonly pattern: string;
  private matcher: Minimatch;
  private excludes: Minimatch[];
  private items: BundledSource[];
  private vfs: typeof vfs;

  constructor(bundle: Bundle, pattern: string, includedBy?: DependencyInclusion) {
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

    this.vfs = vfs;
  }

  addItem(item: BundledSource) {
    item.includedBy = this;
    item.includedIn = this.bundle;
    this.items.push(item);
  }

  _isExcluded(item: BundledSource) {
    const found = this.excludes.findIndex(exclusion => {
      return exclusion.match(item.path);
    });
    return found > -1;
  }

  trySubsume(item: BundledSource) {
    if (this.matcher.match(item.path) && !this._isExcluded(item)) {
      this.addItem(item);
      return true;
    }

    return false;
  }

  addAllMatchingResources() {
    return new Promise<void>((resolve, reject) => {
      const bundler = this.bundle.bundler;
      const pattern = path.resolve(this._getProjectRoot(), this.pattern);

      const subsume = (file: IFile, cb: mapStream.Callback) => {
        bundler.addFile(file, this);
        cb(null, file);
      };

      this.vfs.src(pattern).pipe(mapStream(subsume) as unknown as NodeJS.WritableStream)
        .on('error', e => {
          console.log(`Error while adding all matching resources of pattern "${this.pattern}": ${e.message}`);
          reject(e);
        })
        .on('end', resolve);
    });
  }

  private _getProjectRoot() {
    return this.bundle.bundler.project.paths.root;
  }

  getAllModuleIds() {
    return this.items.map(x => x.moduleId);
  }

  getAllFiles() {
    return this.items;
  }
};
