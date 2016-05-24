"use strict";
const UI = require('../../ui').UI;

module.exports = class {
  static inject() { return [UI]; }

  constructor(ui) {
    this.ui = ui;
  }

  execute(context) {
    let project = context.state.project;

    this.ui.log('Installing project dependencies.')
      .then(() => project.install(this.ui))
      .then(() => this.ui.log('Project dependencies successfully installed.'))
      .then(() => context.next(this.nextActivity));
  }
}
