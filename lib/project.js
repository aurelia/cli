"use strict";
const path = require('path');
const fs = require('fs');

exports.Project = class {
  constructor(directory) {
    this.directory = directory;
    this.taskDirectory = path.join(directory, 'aurelia_project/tasks');
    this.generatorDirectory = path.join(directory, 'aurelia_project/generators');
  }

  getPrimaryExport(m) {
    return m.default;
  }

  getTaskMetadata() {
    return new Promise((resolve, reject) => {
      fs.readdir(this.taskDirectory, (err, files) => {
        if (err) {
          reject(err);
          return;
        }

        let promises = [];
        let helpFiles = [];

        files
          .sort()
          .map(file => path.join(this.taskDirectory, file))
          .filter(file => path.extname(file) === '.json')
          .forEach(file => {
            promises.push(new Promise((resolve, reject) => {
              fs.readFile(file, (err, data) => {
                if (err) reject(err);
                else {
                  helpFiles.push(JSON.parse(data.toString()));
                  resolve();
                }
              });
            }))
          });

        Promise.all(promises).then(() => resolve(helpFiles));
      });
    });
  }

  resolveGenerator(name) {
    let potential = path.join(this.generatorDirectory, `${name}.js`);
    return fileExists(potential);
  }

  resolveTask(name) {
    let potential = path.join(this.taskDirectory, `${name}.js`);
    return fileExists(potential);
  }
}

function fileExists(path) {
  return new Promise((resolve, reject) => {
    fs.exists(path, result => {
      if (result) {
        resolve(path);
      } else {
        resolve(null);
      }
    });
  });
}
