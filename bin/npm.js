"use strict";
const spawn = require('child_process').spawn;
const slice = Array.prototype.slice;

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const cliArgs = [command].concat(args);
    const npm = spawn('npm', cliArgs, options);

    npm.stdout.on('data', data => {
      console.log(data.toString());
    });

    npm.stderr.on('data', data => {
      console.log(data.toString());
    });

    npm.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Error, exited with code ${code}`));
      }
    });
  });
}

exports.NPM = class {
  constructor(options) {
    this.options = options;
  }

  install() {
    const args = [].slice.call(arguments);
    return runCommand('install', args, this.options);
  }

  uninstall() {
    const args = [].slice.call(arguments);
    return runCommand('uninstall', args, this.options);
  }
}
