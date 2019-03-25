const path = require('path');
const fs = require('./file-system');
const Utils = require('./build/utils');

// Legacy code, kept only for supporting `au generate`
exports.ProjectItem = class {
  constructor(name, isDirectory) {
    this.name = name;
    this.isDirectory = !!isDirectory;
  }

  get children() {
    if (!this._children) {
      this._children = [];
    }

    return this._children;
  }

  add() {
    if (!this.isDirectory) {
      throw new Error('You cannot add items to a non-directory.');
    }

    for (let i = 0; i < arguments.length; ++i) {
      let child = arguments[i];

      if (this.children.indexOf(child) !== -1) {
        continue;
      }

      child.parent = this;
      this.children.push(child);
    }

    return this;
  }

  calculateRelativePath(fromLocation) {
    if (this === fromLocation) {
      return '';
    }

    let parentRelativePath = (this.parent && this.parent !== fromLocation)
      ? this.parent.calculateRelativePath(fromLocation)
      : '';

    return path.posix.join(parentRelativePath, this.name);
  }

  create(relativeTo) {
    let fullPath = relativeTo ? this.calculateRelativePath(relativeTo) : this.name;

    if (this.isDirectory) {
      return fs.stat(fullPath)
        .then(result => result)
        .catch(() => fs.mkdir(fullPath))
        .then(() => Utils.runSequentially(this.children, child => child.create(fullPath)));
    }

    if (this.text) {
      return fs.writeFile(fullPath, this.text);
    }

    return Promise.resolve();
  }


  setText(text) {
    this.text = text;
    return this;
  }

  getText() {
    return this.text;
  }

  static text(name, text) {
    return new exports.ProjectItem(name, false).setText(text);
  }

  static directory(p) {
    return new exports.ProjectItem(p, true);
  }
};
