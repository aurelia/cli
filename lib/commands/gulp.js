"use strict";

localResolve(name) {
  let current = process.cwd();
  return resolve(current + '/node_modules')
}

exports.Command = class {
  constructor(commandPath) {
    this.commandPath = commandPath;
  }

  execute(args) {
    try {
      console.log(this.commandPath);

      const gulp = require('gulp');
      console.log('gulp');

      require('babel-polyfill');
      console.log('babel-polyfill');

      require('babel-register')();
      console.log('babel-register');

      const task = require(this.commandPath).default;

      try {
        gulp.parallel(task)(function(e) {
          if (e) {
            console.log(e);
            exit(1);
          }
        });
      } catch (e) {
        console.log(e);
        exit(1);
      }
    } catch(e) {
      console.log(e);
    }
  }
}
