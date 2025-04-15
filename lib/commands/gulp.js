"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
    async execute() {
        const gulp = (await Promise.resolve().then(() => __importStar(require('gulp')))).default;
        this.connectLogging(gulp);
        await this.project.installTranspiler();
        makeInjectable(gulp, 'series', this.container);
        makeInjectable(gulp, 'parallel', this.container);
        return new Promise((resolve, reject) => {
            process.nextTick(async () => {
                const task = this.project.getExport(await Promise.resolve(`${this.options.taskPath}`).then(s => __importStar(require(s))), this.options.commandName);
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
            void this.ui.log(`Starting '${e.name}'...`);
        });
        gulp.on('stop', e => {
            if (e.name[0] === '<')
                return;
            void this.ui.log(`Finished '${e.name}'`);
        });
        gulp.on('error', e => void this.ui.log(e));
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