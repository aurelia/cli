"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aurelia_dependency_injection_1 = require("aurelia-dependency-injection");
const ui_1 = require("../ui");
const cli_options_1 = require("../cli-options");
const project_1 = require("../project");
class default_1 {
    static inject() { return [aurelia_dependency_injection_1.Container, ui_1.UI, cli_options_1.CLIOptions, project_1.Project]; }
    container;
    ui;
    options;
    project;
    constructor(container, ui, options, project) {
        this.container = container;
        this.ui = ui;
        this.options = options;
        this.project = project;
    }
    execute() {
        const gulp = require('gulp');
        this.connectLogging(gulp);
        this.project.installTranspiler();
        makeInjectable(gulp, 'series', this.container);
        makeInjectable(gulp, 'parallel', this.container);
        return new Promise((resolve, reject) => {
            process.nextTick(async () => {
                const task = this.project.getExport(require(this.options.taskPath), this.options.commandName);
                gulp.series(task)(error => {
                    if (error)
                        reject(error);
                    else
                        resolve();
                });
            });
        });
    }
    connectLogging(gulp) {
        gulp.on('start', e => {
            if (e.name[0] === '<')
                return;
            this.ui.log(`Starting '${e.name}'...`);
        });
        gulp.on('stop', e => {
            if (e.name[0] === '<')
                return;
            this.ui.log(`Finished '${e.name}'`);
        });
        gulp.on('error', e => this.ui.log(e));
    }
}
exports.default = default_1;
;
function makeInjectable(gulp, name, container) {
    const original = gulp[name];
    gulp[name] = function () {
        const args = Array.from({ length: arguments.length });
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
//# sourceMappingURL=gulp.js.map