import { Container } from "aurelia-dependency-injection";
import { UI } from "../ui";
import { CLIOptions } from "../cli-options";
import { Project } from "../project";
import { type Gulp } from "gulp";

export = class {
  static inject() { return [Container, UI, CLIOptions, Project]; }

  private container: Container;
  private ui: UI;
  private options: CLIOptions;
  private project: Project;

  constructor(container: Container, ui: UI, options: CLIOptions, project: Project) {
    this.container = container;
    this.ui = ui;
    this.options = options;
    this.project = project;
  }

  execute(): Promise<void> {
    const gulp = require('gulp');
    this.connectLogging(gulp);

    this.project.installTranspiler();

    makeInjectable(gulp, 'series', this.container);
    makeInjectable(gulp, 'parallel', this.container);

    return new Promise<void>((resolve, reject) => {
      process.nextTick(async () => {
        const task = this.project.getExport(require(this.options.taskPath), this.options.commandName);

        gulp.series(task)(error => {
          if (error) reject(error);
          else resolve();
        });
      });
    });
  }

  connectLogging(gulp: Gulp) {
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

function makeInjectable(gulp: Gulp, name: 'series' | 'parallel', container: Container) {
  const original = gulp[name];

  gulp[name] = function() {
    const args = Array.from({ length: arguments.length});

    for (let i = 0, ii = arguments.length; i < ii; ++i) {
      let task = arguments[i];

      if (task.inject) {
        const taskName = task.name;
        task = container.get(task);
        task = task.execute.bind(task);
        task.displayName = taskName;
      }

      args[i] = task;
    }

    return original.apply(gulp, args);
  };
}
