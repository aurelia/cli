'use strict';
const path = require('path');
const fs = require('../file-system');
const Utils = require('./utils');

exports.DependencyDescription = class {
  constructor(name, source) {
    this.name = name;
    this.source = source;
  }

  get mainId() {
    return this.name + '/' + this.loaderConfig.main;
  }

  calculateMainPath(root) {
    let config = this.loaderConfig;
    let part;

    if (config.main) {
      part = path.join(config.path, config.main);
    } else {
      part = config.path;
    }

    let ext = path.extname(part).toLowerCase();
    if (!ext || Utils.knownExtensions.indexOf(ext) === -1) {
      part = part + '.js';
    }

    return path.join(process.cwd(), root, part);
  }

  readMainFileSync(root) {
    let p = this.calculateMainPath(root);

    try {
      return fs.readFileSync(p).toString();
    } catch (e) {
      console.log('error', p);
      return '';
    }
  }
};
