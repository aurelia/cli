"use strict";
const path = require('path');
const fs = require('./file-system');
const locateResource = require('./resources').locateResource;

exports.ProjectItem = class {
  constructor(name, isDirectory) {
    this.name = name;
    this.isDirectory = !!isDirectory;
    this._fileExistsStrategy = 'replace';
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

  skipIfExists() {
    this._fileExistsStrategy = 'skip';
    return this;
  }

  mergeIfExists() {
    this._fileExistsStrategy = 'merge';
    return this;
  }

  askUserIfExists() {
    this._fileExistsStrategy = 'ask';
    return this;
  }

  add() {
    if (!this.isDirectory) {
      throw new Error('You cannot add items to a non-directory.');
    }

    for(let i = 0; i < arguments.length; ++i) {
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

  create(ui, relativeTo) {
    let fullPath = relativeTo ? path.join(relativeTo, this.name) : this.name;

    if (this.isDirectory) {
      return fs.exists(fullPath).then(result => {
        let dirReady = result ? Promise.resolve() : fs.mkdir(fullPath);
        return dirReady.then(() => {
          return Promise.all(this.children.map(child => child.create(ui, fullPath)));
        });
      });
    } else if (this.sourcePath) {
      return fs.readFile(this.sourcePath).then(data => {
        return this._write(fullPath, data, ui);
      });
    } else if (this.jsonObject){
      return this._write(fullPath, JSON.stringify(this.jsonObject, null, 2), ui);
    } else if (this.text) {
      return this._write(fullPath, this.text, ui);
    }

    return Promise.resolve();
  }

  _write(fullPath, content, ui) {
    for(let i = 0, ii = this.transformers.length; i < ii; ++i) {
      content = this.transformers[i](content);
    }

    return fs.exists(fullPath).then(result => {
      if (result) {
        switch (this._fileExistsStrategy) {
          case 'skip':
            return Promise.resolve();
          case 'merge':
            if (this.name = 'package.json') {
              return fs.readFile(fullPath).then(data => {
                let json = JSON.parse(data.toString());
                let merged = mergePackageJson(json, this.jsonObject);
                return fs.writeFile(fullPath, JSON.stringify(merged, null, 2));
              });
            } else {
              throw new Error(`cannot merge ${this.name}`);
            }
          case 'ask':
            let question = `An existing file named '${this.name}' was found. What would you like to do?`;
            let options = [
              {
                displayName: 'Keep It',
                description: 'Keeps your existing file. You may need to update its contents to work with Aurelia.'
              },
              {
                displayName: "Replace It",
                description: "Replaces the existing file with a new one designed for Aurelia."
              }
            ];

            return ui.question(question, options).then(answer => {
              if (answer == options[0]) {
                return Promise.resolve();
              }

              return fs.writeFile(fullPath, content);
            });
          default:
            return fs.writeFile(fullPath, content);
        }
      }

      return fs.writeFile(fullPath, content);
    });
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

function mergePackageJson(existing, update) {
  mergeDependencies(existing, 'dependencies', update.dependencies);
  mergeDependencies(existing, 'peerDependencies', update.peerDependencies);
  mergeDependencies(existing, 'devDependencies', update.devDependencies);
  return existing;
}

function mergeDependencies(source, prop, update) {
  let existing = source[prop] || (source[prop] = {});

  for(let key in update) {
    existing[key] = update[key];
  }
}
