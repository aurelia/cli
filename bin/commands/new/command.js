"use strict";
const NewProjecWizard = require('./new-project-wizard').NewProjecWizard;
const ConsoleUI = require('../../console-ui').ConsoleUI;

exports.Command = class {
  execute(args) {
    let ui = new ConsoleUI();
    let wizard = new NewProjecWizard(ui);

    ui.open();
    wizard.start(args[0]).then(result => {
      console.log(result);
      ui.close();
    });
  }
}
