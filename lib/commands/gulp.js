"use strict";

exports.Command = class {
  constructor(commandPath) {
    this.commandPath = commandPath;
  }

  execute(args) {
    try {
      const gulp = require('gulp');
      this.connectLogging(gulp);

      require('babel-polyfill');
      require('babel-register')({
        plugins: [
          'transform-es2015-modules-commonjs'
        ],
        only: /aurelia_project/
      });

      process.nextTick(() => {
        const task = require(this.commandPath).default;

        gulp.series(task)(function(e) {
          if (e) {
            console.log(e);
          }
        });
      });
    } catch(e) {
      console.log(e);
    }
  }

  connectLogging(gulp) {
    gulp.on('start', function(e) {
      if(e.name[0] === '<') return;
      console.log(`Starting '${e.name}'...`);
    });

    gulp.on('stop', function(e) {
      if(e.name[0] === '<') return;
      console.log(`Finished '${e.name}'`);
    });

    gulp.on('error', function(e) {
      console.error(e);
    });
  }
}
