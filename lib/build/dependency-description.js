"use strict";
const path = require('path');
const fs = require('../file-system');
const knownExtensions = ['.js', '.css', '.svg', '.html'];

exports.DependencyDescription = class {
  constructor(name, source) {
    this.name = name;
    this.source = source;
  }

  calculateMainPath(root) {
    let config = this.loaderConfig;
    let part;

    if (config.main) {
      part = path.join(config.path, config.main);
    } else {
      part = config.path;
    }

    let ext = path.extname(part);
    if (knownExtensions.indexOf(ext) === -1) {
      part = part + '.js';
    }

    return path.join(process.cwd(), root, part);
  }

  readMainFileSync(root) {
    let p = this.calculateMainPath(root);

    try {
      return fs.readFileSync(p).toString();
    } catch(e) {
      console.log('error', p);
      return '';
    }
  }
}
