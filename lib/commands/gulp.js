const UI = require('../ui').UI;
const CLIOptions = require('../cli-options').CLIOptions;
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

      this.project.installTranspiler();

      makeInjectable(gulp, 'series', this.container);
      makeInjectable(gulp, 'parallel', this.container);

      process.nextTick(() => {
        let task = this.project.getExport(require(this.options.taskPath), this.options.commandName);

        gulp.series(task)(error => {
          if (error) reject(error);
          else resolve();
        });
      });
    });
  }

  connectLogging(gulp) {
    gulp.on('start', e => {
      if (e.name[0] === '<') return;
      this.ui.log(`Starting '${e.name}'...`);
    });

    gulp.on('stop', e => {
      if (e.name[0] === '<') return;
      this.ui.log(`Finished '${e.name}'`);
    });

    gulp.on('error', e => this.ui.log(e));
  }
};

function makeInjectable(gulp, name, container) {
  let original = gulp[name];

  gulp[name] = function() {
    let args = new Array(arguments.length);

    for (let i = 0, ii = arguments.length; i < ii; ++i) {
      let task = arguments[i];

      if (task.inject) {
        let taskName = task.name;
        task = container.get(task);
        task = task.execute.bind(task);
        task.displayName = taskName;
      }

      args[i] = task;
    }

    return original.apply(gulp, args);
  };
}
