"use strict";
const path = require('path');
const fs = require('./file-system');

exports.Project = class {
  constructor(directory) {
    this.directory = directory;
    this.taskDirectory = path.join(directory, 'aurelia_project/tasks');
    this.generatorDirectory = path.join(directory, 'aurelia_project/generators');
  }

  installTranspiler() {
    installBabel();
  }

  getPrimaryExport(m) {
    return m.default;
  }

  getGeneratorMetadata() {
    return getMetadata(this.generatorDirectory);
  }

  getTaskMetadata() {
    return getMetadata(this.taskDirectory);
  }

  resolveGenerator(name) {
    let potential = path.join(this.generatorDirectory, `${name}.js`);
    return fs.exists(potential).then(result => result ? potential : null);
  }

  resolveTask(name) {
    let potential = path.join(this.taskDirectory, `${name}.js`);
    return fs.exists(potential).then(result => result ? potential : null);
  }
}

function getMetadata(dir) {
  return fs.readdir(dir).then(files => {
    return Promise.all(
      files
        .sort()
        .map(file => path.join(dir, file))
        .filter(file => path.extname(file) === '.json')
        .map(file => fs.readFile(file).then(data => JSON.parse(data.toString())))
    );
  });
}

function installBabel() {
  require('babel-polyfill');
  require('babel-register')({
    plugins: [
      'transform-es2015-modules-commonjs'
    ],
    only: /aurelia_project/
  });
}
