"use strict";
const path = require('path');
const fs = require('fs');

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

  calculateRelativePath() {
    let parentRelativePath = this.parent ? this.parent.calculateRelativePath() : '';
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
      return new Promise((resolve, reject) => {
        fs.mkdir(fullPath, (error, result) => {
          if(error) return reject(error);
          Promise.all(this.children.map(child => child.create(fullPath))).then(resolve);
        });
      });
    } else if (this.resourcePath) {
      return new Promise((resolve, reject) => {
        fs.readFile(this.resourcePath, (error, data) => {
          if(error) reject(error);
          else {
            this._write(fullPath, data, resolve, reject);
          }
        });
      });
    } else if (this.jsonObject){
      return new Promise((resolve, reject) => {
        this._write(fullPath, JSON.stringify(this.jsonObject, null, 2), resolve, reject);
      });
    } else if (this.text) {
      return new Promise((resolve, reject) => {
        this._write(fullPath, this.text, resolve, reject);
      });
    }

    return Promise.resolve();
  }

  _write(fullPath, content, resolve, reject) {
    for(let i = 0, ii = this.transformers.length; i < ii; ++i) {
      content = this.transformers[i](content);
    }

    fs.writeFile(fullPath, content, 'utf8', error => {
      if (error) reject(error);
      else resolve();
    });
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
