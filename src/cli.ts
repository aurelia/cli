import * as path from 'node:path';
import { Container } from 'aurelia-dependency-injection';
import * as fs from './file-system';
import * as ui from './ui';
import { Project } from './project';
import { CLIOptions } from "./cli-options";
import * as LogManager from 'aurelia-logging';
import { Logger } from './logger';

export class CLI {
  private options: CLIOptions;
  private container: Container;
  private ui: ui.ConsoleUI;
  private logger: LogManager.Logger;
  private project: Project | undefined;

  constructor(options: CLIOptions) {
    this.options = options || new CLIOptions();
    this.container = new Container();
    this.ui = new ui.ConsoleUI(this.options);
    this.configureContainer();
    this.logger = LogManager.getLogger('CLI');
  }

  // Note: cannot use this.logger.error inside run()
  // because logger is not configured yet!
  // this.logger.error prints nothing in run(),
  // directly use this.ui.log.
  async run(cmd: string, args: string[]): Promise<void> {
    const version = `${this.options.runningGlobally ? 'Global' : 'Local'} aurelia-cli v${(require('../package.json')).version}`;

    if (cmd === '--version' || cmd === '-v') {
      return this.ui.log(version);
    }

    const project = await (cmd === 'new' ? Promise.resolve() : this._establishProject());
    this.ui.log(version);
    if (project && this.options.runningLocally) {
      this.project = project;
      this.container.registerInstance(Project, project);
    } else if (project && this.options.runningGlobally) {
      this.ui.log('The current directory is likely an Aurelia-CLI project, but no local installation of Aurelia-CLI could be found. ' +
        '(Do you need to restore node modules using npm install?)');
      return Promise.resolve();
    } else if (!project && this.options.runningLocally) {
      this.ui.log('It appears that the Aurelia CLI is running locally from ' + __dirname + '. However, no project directory could be found. ' +
        'The Aurelia CLI has to be installed globally (npm install -g aurelia-cli) and locally (npm install aurelia-cli) in an Aurelia CLI project directory');
      return Promise.resolve();
    }
    const command = await this.createCommand(cmd, args);
    return command.execute(args);
  }

  configureLogger() {
    LogManager.addAppender(this.container.get(Logger));
    const level = CLIOptions.hasFlag('debug') ? LogManager.logLevel.debug : LogManager.logLevel.info;
    LogManager.setLevel(level);
  }

  configureContainer() {
    this.container.registerInstance(CLIOptions, this.options);
    this.container.registerInstance(ui.UI, this.ui);
  }

  async createCommand(commandText: string, commandArgs: string[]): Promise<any> {
    if (!commandText) {
      return this.createHelpCommand();
    }

    const parts = commandText.split(':');
    const commandModule = parts[0];
    const commandName = parts[1] || 'default';
    try {
      const alias = require('./commands/alias.json')[commandModule];
      const found = this.container.get(require(`./commands/${alias || commandModule}/command`).default);
      Object.assign(this.options, { args: commandArgs });
      // need to configure logger after getting args
      this.configureLogger();
      return found;
    } catch {
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

          return this.container.get(require('./commands/gulp').default);
        } else {
          this.ui.log(`Invalid Command: ${commandText}`);
          return this.createHelpCommand();
        }
      } else {
        this.ui.log(`Invalid Command: ${commandText}`);
        return this.createHelpCommand();
      }
    }
  }

  async createHelpCommand() {
    return this.container.get(require('./commands/help/command').default);
  }

  async _establishProject(): Promise<Project | void> {
    const dir = await determineWorkingDirectory(process.cwd());
    return dir ? await Project.establish(dir) : this.ui.log('No Aurelia project found.');
  }
};

async function determineWorkingDirectory(dir: string): Promise<string | void> {
  const parent = path.join(dir, '..');

  if (parent === dir) {
    return Promise.resolve(); // resolve to nothing
  }

  try {
    await fs.stat(path.join(dir, 'aurelia_project'));
    return dir;
  } catch {
    return await determineWorkingDirectory(parent);
  }
}

process.on('unhandledRejection', (reason) => {
  console.log('Uncaught promise rejection:');
  console.log(reason);
});
