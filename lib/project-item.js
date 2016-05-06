"use strict";
const path = require('path');
const fs = require('./file-system');

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

  get transformers() {
    if (!this._transformers) {
      this._transformers = [];
    }

    return this._transformers;
  }

  add() {
    if (!this.isDirectory) {
      throw new Error('You cannot add items to a non-directory.');
    }

    for(let i = 0; i < arguments.length; ++i) {
      let child = arguments[i];
      child.parent = this;
      this.children.push(child);
    }

    return this;
  }

  calculateRelativePath(fromLocation) {
    let parentRelativePath = (this.parent && this.parent !== fromLocation)
      ? this.parent.calculateRelativePath(fromLocation)
      : '';

    return path.join(parentRelativePath, this.name);
  }

  setJSONObject(jsonObject) {
    this.jsonObject = jsonObject;
    return this;
  }

  setText(text) {
    this.text = text;
    return this;
  }

  setResourcePath(path) {
    this.resourcePath = path;
    return this;
  }

  transformWith(callback) {
    this.transformers.push(callback);
    return this;
  }

  create(location) {
    let fullPath = path.join(location, this.name);

    if (this.isDirectory) {
      return fs.mkdir(fullPath).then(() => {
        return Promise.all(this.children.map(child => child.create(fullPath)));
      });
    } else if (this.resourcePath) {
      return fs.readFile(this.resourcePath).then(data => {
        return this._write(fullPath, data);
      });
    } else if (this.jsonObject){
      return this._write(fullPath, JSON.stringify(this.jsonObject, null, 2));
    } else if (this.text) {
      return this._write(fullPath, this.text);
    }

    return Promise.resolve();
  }

  _write(fullPath, content) {
    for(let i = 0, ii = this.transformers.length; i < ii; ++i) {
      content = this.transformers[i](content);
    }

    return fs.writeFile(fullPath, content);
  }

  static jsonObject(name, jsonObject) {
    let item = new exports.ProjectItem(name, false);
    item.setJSONObject(jsonObject);
    return item;
  }

  static resource(name, resourcePath) {
    let item = new exports.ProjectItem(name, false);
    item.setResourcePath(resourcePath);
    return item;
  }

  static file(name) {
    return new exports.ProjectItem(name, false);
  }

  static directory(name) {
    return new exports.ProjectItem(name, true);
  }
}
