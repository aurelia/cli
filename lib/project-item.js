"use strict";
const path = require('path');
const fs = require('./file-system');
const locateResource = require('./resources').locateResource;

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

  setSourcePath(path) {
    this.sourcePath = path;
    return this;
  }

  transformWith(callback) {
    this.transformers.push(callback);
    return this;
  }

  create(location) {
    let fullPath = path.join(location, this.name);

    if (this.isDirectory) {
      return fs.exists(fullPath).then(result => {
        let dirReady = result ? Promise.resolve() : fs.mkdir(fullPath);
        return dirReady.then(() => {
          return Promise.all(this.children.map(child => child.create(fullPath)));
        });
      });
    } else if (this.sourcePath) {
      return fs.readFile(this.sourcePath).then(data => {
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
    return new exports.ProjectItem(name, false).setJSONObject(jsonObject);
  }

  static text(name, text) {
    return new exports.ProjectItem(name, false).setText(text);
  }

  static resource(name, resourcePath, extensionOrConfig) {
    if (extensionOrConfig) {
      if (extensionOrConfig.fileExtension) {
        extensionOrConfig = extensionOrConfig.fileExtension;
      }

      name = name.replace('.ext', extensionOrConfig);
      resourcePath = resourcePath.replace('.ext', extensionOrConfig);
    }

    return exports.ProjectItem.source(name, locateResource(resourcePath));
  }

  static source(name, path) {
    return new exports.ProjectItem(name, false).setSourcePath(path);
  }

  static file(name) {
    return new exports.ProjectItem(name, false);
  }

  static directory(path) {
    return new exports.ProjectItem(path, true);
  }
}
