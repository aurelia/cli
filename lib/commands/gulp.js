"use strict";
const CLIOptions = require('../cli').CLIOptions;
const Container = require('aurelia-dependency-injection');

module.exports = class {
  static inject() { return [CLIOptions]; }

  constructor(options) {
    this.options = options;
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
        let task = require(this.options.taskPath).default;

        if (task.inject) {
          task = this.container.get(task);

          if (task.execute) {
            task = task.execute.bind(task);
          }
        }

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
