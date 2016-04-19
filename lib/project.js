"use strict";
const path = require('path');
const fs = require('fs');

exports.Project = class {
  constructor(directory) {
    this.directory = directory;
  }

  locateTask(task) {
    let potential = path.join(this.directory, `aurelia_project/tasks/${task}.js`);

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
