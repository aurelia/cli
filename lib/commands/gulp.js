"use strict";
const UI = require('../ui').UI;
const CLIOptions = require('../cli').CLIOptions;
const Container = require('aurelia-dependency-injection').Container;
const Project = require('../project').Project;

module.exports = class {
  static inject() { return [Container, UI, CLIOptions, Project]; }

  constructor(container, ui, options, project) {
    this.container = container;
    this.ui = ui;
    this.options = options;
    this.project = project;
  }

  execute(args) {
    return new Promise((resolve, reject) => {
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
        let task = this.project.getPrimaryExport(require(this.options.taskPath));

        if (task.inject) {
          task = this.container.get(task);

          if (task.execute) {
            task = task.execute.bind(task);
          }
        }

        gulp.series(task)(error => {
          if (error) reject(error);
          else resolve();
        });
      });
    });
  }

  connectLogging(gulp) {
    gulp.on('start', e => {
      if(e.name[0] === '<') return;
      this.ui.log(`Starting '${e.name}'...`);
    });

    gulp.on('stop', e => {
      if(e.name[0] === '<') return;
      this.ui.log(`Finished '${e.name}'`);
    });

    gulp.on('error', e => this.ui.log(e));
  }
}
