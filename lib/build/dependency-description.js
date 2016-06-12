"use strict";
const path = require('path');
const fs = require('../file-system');

exports.DependencyDescription = class {
  constructor(name, source) {
    this.name = name;
    this.source = source;
  }

  calculateMainPath(root) {
    let config = this.loaderConfig;
    let part;

    if (config.main) {
      part = path.join(config.path, config.main) + '.js';
    } else {
      part = config.path + '.js';
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
