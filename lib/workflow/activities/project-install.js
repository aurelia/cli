"use strict";
const os = require('os');
const UI = require('../../ui').UI;

module.exports = class {
  static inject() { return [UI]; }

  constructor(ui) {
    this.ui = ui;
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
        this.ui.log(os.EOL + 'Installing project dependencies.')
          .then(() => project.install(this.ui))
          .then(() => this.ui.log('Project dependencies successfully installed.'))
          .then(() => context.next(this.nextActivity));
      }

      return this.ui.log(os.EOL + 'Dependencies not installed.')
        .then(() => context.next());
    });
  }
}
