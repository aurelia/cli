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
exports.CLI = void 0;
const path = __importStar(require("node:path"));
const aurelia_dependency_injection_1 = require("aurelia-dependency-injection");
const fs = __importStar(require("./file-system"));
const ui = __importStar(require("./ui"));
const project_1 = require("./project");
const cli_options_1 = require("./cli-options");
const LogManager = __importStar(require("aurelia-logging"));
const logger_1 = require("./logger");
class CLI {
    options;
    container;
    ui;
    logger;
    project;
    constructor(options) {
        this.options = options || new cli_options_1.CLIOptions();
        this.container = new aurelia_dependency_injection_1.Container();
        this.ui = new ui.ConsoleUI(this.options);
        this.configureContainer();
        this.logger = LogManager.getLogger('CLI');
    }
    // Note: cannot use this.logger.error inside run()
    // because logger is not configured yet!
    // this.logger.error prints nothing in run(),
    // directly use this.ui.log.
    async run(cmd, args) {
        const version = `${this.options.runningGlobally ? 'Global' : 'Local'} aurelia-cli v${(require('../package.json')).version}`;
        if (cmd === '--version' || cmd === '-v') {
            return this.ui.log(version);
        }
        const project = await (cmd === 'new' ? Promise.resolve() : this._establishProject());
        this.ui.log(version);
        if (project && this.options.runningLocally) {
            this.project = project;
            this.container.registerInstance(project_1.Project, project);
        }
        else if (project && this.options.runningGlobally) {
            this.ui.log('The current directory is likely an Aurelia-CLI project, but no local installation of Aurelia-CLI could be found. ' +
                '(Do you need to restore node modules using npm install?)');
            return Promise.resolve();
        }
        else if (!project && this.options.runningLocally) {
            this.ui.log('It appears that the Aurelia CLI is running locally from ' + __dirname + '. However, no project directory could be found. ' +
                'The Aurelia CLI has to be installed globally (npm install -g aurelia-cli) and locally (npm install aurelia-cli) in an Aurelia CLI project directory');
            return Promise.resolve();
        }
        const command = await this.createCommand(cmd, args);
        return command.execute(args);
    }
    configureLogger() {
        LogManager.addAppender(this.container.get(logger_1.Logger));
        const level = cli_options_1.CLIOptions.hasFlag('debug') ? LogManager.logLevel.debug : LogManager.logLevel.info;
        LogManager.setLevel(level);
    }
    configureContainer() {
        this.container.registerInstance(cli_options_1.CLIOptions, this.options);
        this.container.registerInstance(ui.UI, this.ui);
    }
    async createCommand(commandText, commandArgs) {
        if (!commandText) {
            return this.createHelpCommand();
        }
        const parts = commandText.split(':');
        const commandModule = parts[0];
        const commandName = parts[1] || 'default';
        try {
            const alias = require('./commands/alias.json')[commandModule];
            const found = this.container.get(require(`./commands/${alias || commandModule}/command`));
            Object.assign(this.options, { args: commandArgs });
            // need to configure logger after getting args
            this.configureLogger();
            return found;
        }
        catch {
            if (this.project) {
                const taskPath = await this.project.resolveTask(commandModule);
                if (taskPath) {
                    Object.assign(this.options, {
                        taskPath: taskPath,
                        args: commandArgs,
                        commandName: commandName
                    });
                    // need to configure logger after getting args
                    this.configureLogger();
                    return this.container.get(this.container.get(require('./commands/gulp')));
                }
                else {
                    this.ui.log(`Invalid Command: ${commandText}`);
                    return this.createHelpCommand();
                }
            }
            else {
                this.ui.log(`Invalid Command: ${commandText}`);
                return this.createHelpCommand();
            }
        }
    }
    async createHelpCommand() {
        return this.container.get(require('./commands/help/command'));
    }
    async _establishProject() {
        const dir = await determineWorkingDirectory(process.cwd());
        return dir ? await project_1.Project.establish(dir) : this.ui.log('No Aurelia project found.');
    }
}
exports.CLI = CLI;
;
async function determineWorkingDirectory(dir) {
    const parent = path.join(dir, '..');
    if (parent === dir) {
        return Promise.resolve(); // resolve to nothing
    }
    try {
        await fs.stat(path.join(dir, 'aurelia_project'));
        return dir;
    }
    catch {
        return await determineWorkingDirectory(parent);
    }
}
process.on('unhandledRejection', (reason) => {
    console.log('Uncaught promise rejection:');
    console.log(reason);
});
//# sourceMappingURL=cli.js.map