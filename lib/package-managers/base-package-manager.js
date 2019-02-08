'use strict';

const childProcess = require('child_process');
const npmWhich = require('npm-which');

exports.BasePackageManager = class {
  constructor(executableName) {
    this.executableName = executableName;
  }

  install(packages = [], workingDirectory = process.cwd(), command = 'install') {
    return new Promise((resolve, reject) => {
      childProcess.spawn(
        this.getExecutablePath(workingDirectory),
        [command, ...packages],
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

exports.default = exports.BasePackageManager;
