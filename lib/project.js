"use strict";
const path = require('path');
const fs = require('fs');

exports.Project = class {
  constructor(directory) {
    this.directory = directory;
    this.taskDirectory = path.join(directory, 'aurelia_project/tasks');
  }

  getTaskHelpFiles() {
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

  locateTask(task) {
    let potential = path.join(this.taskDirectory, `${task}.js`);

    return new Promise((resolve, reject) => {
      fs.exists(potential, result => {
        if (result) {
          resolve(potential);
        } else {
          resolve(null);
        }
      });
    });
  }
}
