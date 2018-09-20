'use strict';

const childProcess = require('child_process');
const npmWhich = require('npm-which');

exports.NPM = class {
  constructor() {
    this.executableName = 'npm';
  }

  install(packages, workingDirectory) {
    if (!workingDirectory) workingDirectory = process.cwd();

    return new Promise((resolve, reject) => {
      let executablePath = this.getExecutablePath(workingDirectory);
      let cmd = this.installCommand(executablePath, packages);

      let installProcess = childProcess.exec(cmd, {cwd: workingDirectory}, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });

      installProcess.stdout.on('data', data => console.log(data));
    });
  }

  installCommand(executablePath, packages) {
    let cmd = `"${executablePath}" install`;
    if (packages && packages.length > 0) {
      cmd += ` ${packages.join(' ')}`;
    }
    return cmd;
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
