import { Container } from 'aurelia-dependency-injection';
import { UI } from '../ui';
import { CLIOptions } from '../cli-options';
import { Project } from '../project';
import { type Gulp } from 'gulp';
import type * as Undertaker from 'undertaker';

export default class {
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

  async execute(): Promise<void> {
    const { default: gulp } = await import('gulp');
    this.connectLogging(gulp);

    await this.project.installTranspiler();

    makeInjectable(gulp, 'series', this.container);
    makeInjectable(gulp, 'parallel', this.container);

    return new Promise<void>((resolve, reject) => {
      process.nextTick(async () => {
        const task = this.project.getExport(await import(this.options.taskPath), this.options.commandName);

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
      void this.ui.log(`Starting '${e.name}'...`);
    });

    gulp.on('stop', e => {
      if (e.name[0] === '<') return;
      void this.ui.log(`Finished '${e.name}'`);
    });

    gulp.on('error', e => void this.ui.log(e));
  }
};

function makeInjectable(gulp: Gulp, name: 'series' | 'parallel', container: Container) {
  const original = gulp[name];

  gulp[name] = function() {
    const args = Array.from({ length: arguments.length});

    // `arguments` can be both spread tasks `(...tasks: Undertaker.Task[])` and an array `(tasks: Undertaker.Task[])`
    // eslint-disable-next-line prefer-rest-params
    const inputParams = arguments as unknown as Undertaker.Task[] | [Undertaker.Task[]];
    const tasks: Undertaker.Task[] = (inputParams.length === 1 && Array.isArray(inputParams[0]) ? inputParams[0] : inputParams) as  Undertaker.Task[];

    for (let i = 0, ii = tasks.length; i < ii; ++i) {
      let task;
      task = tasks[i];

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
