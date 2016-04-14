"use strict";

exports.Command = class {
  constructor(commandPath) {
    this.commandPath = commandPath;
  }

  execute(args) {
    try {
      const gulp = require('gulp');
      
      require('babel-polyfill');
      require('babel-register')({
        plugins: [
          'transform-es2015-modules-commonjs'
        ],
        only: /aurelia_project/
      });

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
