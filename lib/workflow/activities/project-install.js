'use strict';
const os = require('os');
const UI = require('../../ui').UI;
const transform = require('../../colors/transform');
const createLines = require('../../string').createLines;
const Yarn = require('../../package-managers/yarn').Yarn;
const CLIOptions = require('../../cli-options').CLIOptions;

module.exports = class {
  static inject() { return [UI, CLIOptions]; }

  constructor(ui, options) {
    this.ui = ui;
    this.options = options;
  }

  execute(context) {
    let project = context.state.project;
    let options = [];

    let yarn = new Yarn();
    if (yarn.isAvailable(project.getWorkingDirectory())) {
      this.ui.log('Note: lock files are not cross compatible between package managers. Choose Yarn here only if you intend to use Yarn for future package installs. Alternatively, remove either yarn.lock or package-lock.json from the project directory before installing new packages.');
      options =  [
        {
          displayName: 'Yes, use Yarn',
          description: 'Installs all server, client and tooling dependencies needed to build the project using Yarn.',
          value: 'yarn'
        },
        {
          displayName: 'Yes, use NPM',
          description: 'Installs all server, client and tooling dependencies needed to build the project using NPM.',
          value: 'npm'
        },
        {
          displayName: 'No',
          description: 'Completes the new project wizard without installing dependencies.',
          value: 'no'
        }
      ];
    } else {
      options = [
        {
          displayName: 'Yes',
          description: 'Installs all server, client and tooling dependencies needed to build the project.',
          value: 'yes'
        },
        {
          displayName: 'No',
          description: 'Completes the new project wizard without installing dependencies.',
          value: 'no'
        }
      ];
    }

    return this.ui.question('Would you like to install the project dependencies?', options).then(answer => {
      if (answer.value === 'yes' || answer.value === 'npm' || answer.value === 'yarn') {
        const packageManager = answer.value === 'yes' ? 'npm' : answer.value;

        return project.savePackageManager(packageManager)
          .then(() => this.ui.log(os.EOL + 'Installing project dependencies.'))
          .then(() => project.install(this.ui, packageManager))
          .then(() => this.displayCompletionMessage(project))
          .then(() => context.next(this.nextActivity));
      }

      return this.ui.log(os.EOL + 'Dependencies not installed.')
        .then(() => context.next());
    });
  }

  displayCompletionMessage(project) {
    let message = '<bgGreen><white><bold>Getting started</bold></white></bgGreen> ' + os.EOL + os.EOL;
    message += 'Now it\'s time for you to get started. It\'s easy.';

    let runCommand = 'au run';

    if (project.model.bundler.id === 'webpack' && project.model.platform.id === 'aspnetcore') {
      runCommand = 'dotnet run';
    }

    if (this.options.hasFlag('here')) {
      message += ` Simply run your new app with <magenta><bold>${runCommand}</bold></magenta>.`;
    } else {
      message += ` First, change directory into your new project's folder. You can use <magenta><bold>cd ${project.model.name}</bold></magenta> to get there. Once in your project folder, simply run your new app with <magenta><bold>${runCommand}</bold></magenta>.`;
    }

    if (project.model.bundler.id === 'cli' || project.model.platform.id === 'web') {
      message += ' Your app will run fully bundled. If you would like to have it auto-refresh whenever you make changes to your HTML, JavaScript or CSS, simply use the <yellow>--watch</yellow> flag';
    }

    message += ' If you want to build your app for production, run <magenta><bold>au build --env prod</bold></magenta>. That\'s just about all there is to it. If you need help, simply run <magenta><bold>au help</bold></magenta>.';

    return this.ui.log(transform('<bgGreen><white><bold>Congratulations</bold></white></bgGreen>') + os.EOL + os.EOL)
      .then(() => this.ui.log(`Congratulations! Your Project "${project.model.name}" Has Been Created!` + os.EOL + os.EOL))
      .then(() => project.renderManualInstructions())
      .then(() => this.ui.log(createLines(transform(message), '', this.ui.getWidth())))
      .then(() => this.ui.log(os.EOL + os.EOL + 'Happy Coding!'));
  }
};
