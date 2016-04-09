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

  withChild(item) {
    this.children.push(item);
    return this;
  }

  withJSONObject(jsonObject) {
    this.jsonObject = jsonObject;
    return this;
  }

  withText(text) {
    this.text = text;
    return this;
  }

  asResources(path) {
    this.resourcePath = path;
    return this;
  }

  create(location) {
    let fullPath = path.join(location, this.name);

    console.log(fullPath);

    if (this.isDirectory) {
      return new Promise((resolve, reject) => {
        fs.mkdir(fullPath, (error, result) => {
          if(error) return reject(error);
          Promise.all(this.children.map(child => child.create(fullPath))).then(resolve);
        });
      });
    } else if (this.resourcePath) {
      return new Promise((resolve, reject) => {

      });
    } else if (this.jsonObject){
      return new Promise((resolve, reject) => {
        fs.writeFile(fullPath, JSON.stringify(this.jsonObject, null, 2), 'utf8', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else if (this.text) {
      return new Promise((resolve, reject) => {
        fs.writeFile(fullPath, this.text, 'utf8', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    return Promise.resolve();
  }

  static jsonObject(name, jsonObject) {
    return new exports.ProjectItem(name, false).withJSONObject(jsonObject);
  }

  static resource(name, resourcePath) {
    return new exports.ProjectItem(name, false).asResources(resourcePath);
  }

  static file(name) {
    return new exports.ProjectItem(name, false);
  }

  static directory(name) {
    return new exports.ProjectItem(name, true);
  }
}
