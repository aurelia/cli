"use strict";

let isLoaded = false;

exports.NPM = class {
  install(packages, npmOptions) {
    npmOptions = npmOptions || {};
    const npm = require('npm');

    let originalWorkingDirectory = process.cwd();
    process.chdir(npmOptions.workingDirectory || process.cwd());

    return load(npm, npmOptions)
      .then(() => {
        return new Promise((resolve, reject) => {
          npm.commands.install(packages, error => {
            process.chdir(originalWorkingDirectory);

            if (error) reject(error);
            else resolve();
          });
        });
      }).catch(error => {
        process.chdir(originalWorkingDirectory);
        throw error;
      });
  }
}

function load(npm, npmOptions) {
  if (isLoaded) {
    for(let key in npmOptions) {
      npm.config.set(key, npmOptions[key]);
    }

    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    npm.load(npmOptions, error => {
      if (error) reject(error);
      else {
        isLoaded = true;
        resolve();
      }
    });
  })
}
