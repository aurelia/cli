'use strict';

const childProcess = require('child_process');
const npmWhich = require('npm-which');

exports.NPM = class {
  constructor() {
    this.executableName = 'npm';
  }

  install(packages = [], workingDirectory = process.cwd()) {
    return new Promise((resolve, reject) => {
      childProcess.spawn(
        this.getExecutablePath(workingDirectory),
        ['install', ...packages],
        { stdio: 'inherit', cwd: workingDirectory }
      )
        .on('close', () => resolve())
        .on('error', error => reject(error));
    });
  }

  getExecutablePath(directory) {
    try {
      return npmWhich(directory).sync(this.executableName);
    } catch (e) {
      return null;
    }
  }

  isAvailable(directory) {
    return !!this.getExecutablePath(directory);
  }
};

exports.default = exports.NPM;
