'use strict';

const childProcess = require('child_process');
const npmWhich = require('npm-which');

exports.Yarn = class {
  install(packages, options) {
    return new Promise((resolve, reject) => {
      if (!options) {
        options = {};
      }
      if (!options.cwd) {
        options.cwd = process.cwd();
      }
      let yarnPath = this.getYarnPath(options.cwd);
      let cmd = `"${yarnPath}"`;

      if (packages && packages.length > 0) {
        cmd += ` add ${packages.join(' ')}`;
      }

      let installProcess = childProcess.exec(cmd, options, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });

      installProcess.stdout.on('data', data => console.log(data));
    });
  }

  getYarnPath(directory) {
    return getPathToExecutable('yarn', directory);
  }

  isAvailable(directory) {
    return !!this.getYarnPath(directory);
  }
};

function getPathToExecutable(executableName, directory) {
  try {
    return npmWhich(directory).sync(executableName);
  } catch (ex) {
    return null;
  }
}

exports.default = exports.Yarn;
