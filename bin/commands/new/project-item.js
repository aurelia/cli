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

  add() {
    if (!this.isDirectory) {
      throw new Error('You cannot add items to a non-directory.');
    }

    for(let i = 0; i < arguments.length; ++i) {
      console.log(arguments[i]);
      this.children.push(arguments[i]);
    }
  }

  setJSONObject(jsonObject) {
    this.jsonObject = jsonObject;
  }

  setText(text) {
    this.text = text;
  }

  setResourcePath(path) {
    this.resourcePath = path;
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
            fs.writeFile(fullPath, data, error => {
              if (error) reject(error);
              else resolve();
            });
          }
        });
      });
    } else if (this.jsonObject){
      return new Promise((resolve, reject) => {
        fs.writeFile(fullPath, JSON.stringify(this.jsonObject, null, 2), 'utf8', error => {
          if (error) reject(error);
          else resolve();
        });
      });
    } else if (this.text) {
      return new Promise((resolve, reject) => {
        fs.writeFile(fullPath, this.text, 'utf8', error => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    return Promise.resolve();
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
