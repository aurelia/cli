const path = require('path');
const Container = require('aurelia-dependency-injection').Container;
const fs = require('./file-system');
const ui = require('./ui');
const Project = require('./project').Project;
const CLIOptions = require('./cli-options').CLIOptions;
const LogManager = require('aurelia-logging');
const Logger = require('./logger').Logger;

exports.CLI = class {
  constructor(options) {
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
  run(cmd, args) {
    const version = `${this.options.runningGlobally ? 'Global' : 'Local'} aurelia-cli v${require('../package.json').version}`;

    if (cmd === '--version' || cmd === '-v') {
      return this.ui.log(version);
    }

    return (cmd === 'new' ? Promise.resolve() : this._establishProject())
      .then(project => {
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

        return this.createCommand(cmd, args)
          .then((command) => command.execute(args));
      });
  }

  configureLogger() {
    LogManager.addAppender(this.container.get(Logger));
    let level = CLIOptions.hasFlag('debug') ? LogManager.logLevel.debug : LogManager.logLevel.info;
    LogManager.setLevel(level);
  }

  configureContainer() {
    this.container.registerInstance(CLIOptions, this.options);
    this.container.registerInstance(ui.UI, this.ui);
  }

  createCommand(commandText, commandArgs) {
    return new Promise((resolve, reject) => {
      if (!commandText) {
        resolve(this.createHelpCommand());
        return;
      }

      let parts = commandText.split(':');
      let commandModule = parts[0];
      let commandName = parts[1] || 'default';

      try {
        let alias = require('./commands/alias.json')[commandModule];
        let found = this.container.get(require(`./commands/${alias || commandModule}/command`));
        Object.assign(this.options, { args: commandArgs });
        // need to configure logger after getting args
        this.configureLogger();
        resolve(found);
      } catch (e) {
        if (this.project) {
          this.project.resolveTask(commandModule).then(taskPath => {
            if (taskPath) {
              Object.assign(this.options, {
                taskPath: taskPath,
                args: commandArgs,
                commandName: commandName
              });
              // need to configure logger after getting args
              this.configureLogger();

              resolve(this.container.get(require('./commands/gulp')));
            } else {
              this.ui.log(`Invalid Command: ${commandText}`);
              resolve(this.createHelpCommand());
            }
          });
        } else {
          this.ui.log(`Invalid Command: ${commandText}`);
          resolve(this.createHelpCommand());
        }
      }
    });
  }

  createHelpCommand() {
    return this.container.get(require('./commands/help/command'));
  }

  _establishProject() {
    return determineWorkingDirectory(process.cwd())
      .then(dir => dir ? Project.establish(dir) : this.ui.log('No Aurelia project found.'));
  }
};

function determineWorkingDirectory(dir) {
  let parent = path.join(dir, '..');

  if (parent === dir) {
    return Promise.resolve(); // resolve to nothing
  }

  return fs.stat(path.join(dir, 'aurelia_project'))
    .then(() => dir)
    .catch(() => determineWorkingDirectory(parent));
}

process.on('unhandledRejection', (reason) => {
  console.log('Uncaught promise rejection:');
  console.log(reason);
});
