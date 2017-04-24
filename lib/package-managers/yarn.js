'use strict';

const childProcess = require('child_process');

exports.yarn = class {
  install(packages) {
    return new Promise((resolve, reject) => {
      let cmd = `yarn add ${packages.join(' ')}`;
      let options = { cwd: process.cwd() };

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
};

exports.default = exports.yarn;
