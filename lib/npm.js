"use strict";

exports.NPM = class {
  install(packages, npmOptions) {
    npmOptions = npmOptions || {};

    return new Promise((resolve, reject) => {
      const npm = require('npm');

      let originalWorkingDirectory = process.cwd();
      process.chdir(npmOptions.workingDirectory || process.cwd());

      npm.load(npmOptions, error => {
        if (error) {
          process.chdir(originalWorkingDirectory);
          reject(error);
          return;
        }

        npm.commands.install(packages, error => {
          process.chdir(originalWorkingDirectory);

          if (error) reject(error);
          else resolve();
        });
      });
    });
  }
}
