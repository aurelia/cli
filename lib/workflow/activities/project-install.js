"use strict";
const os = require('os');
const UI = require('../../ui').UI;
const transform = require('../../colors/transform');
const createLines = require('../../string').createLines;
const CLIOptions = require('../../cli-options').CLIOptions;

module.exports = class {
  static inject() { return [UI, CLIOptions]; }

  constructor(ui, options) {
    this.ui = ui;
    this.options = options;
  }

  execute(context) {
    let project = context.state.project;

    return this.ui.question('Would you like to install the project dependencies?', [
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
    ]).then(answer => {
      if (answer.value === 'yes') {
        return this.ui.log(os.EOL + 'Installing project dependencies.')
          .then(() => project.install(this.ui))
          .then(() => this.displayCompletionMessage(project))
          .then(() => context.next(this.nextActivity));
      }

      return this.ui.log(os.EOL + 'Dependencies not installed.')
        .then(() => context.next());
    });
  }

  displayCompletionMessage(project) {
    let notHereMessage = ` First, change directory into your new project's folder. You can use <magenta><bold>cd ${project.model.name}</bold></magenta> to get there. Once in your project folder, simply run your new app with <magenta><bold>au run</bold></magenta>.`;
    let hereMessage = ` Simply run your new app with <magenta><bold>au run</bold></magenta>.`;

    let message = transform(`Now it's time for you to get started. It's easy.` +
    (this.options.hasFlag('here') ? hereMessage : notHereMessage) +
    ` Your app will run fully bundled. If you would like to have it auto-refresh whenever you make changes to your HTML, JavaScript or CSS, simply use the <yellow>--watch</yellow> flag. If you want to build your app for production, run <magenta><bold>au build --env prod</bold></magenta>. That's just about all there is to it. If you need help, simply run <magenta><bold>au help</bold></magenta>.`);

    return this.ui.clearScreen()
      .then(() => this.ui.log(`Congratulations! Your Project "${project.model.name}" Has Been Created!` + os.EOL + os.EOL))
      .then(() => this.ui.log(createLines(message, '', this.ui.getWidth())))
      .then(() => this.ui.log(os.EOL + os.EOL + 'Happy Coding!'));
  }
}
