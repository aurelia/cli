"use strict";
const NewProjecWizard = require('./new-project-wizard').NewProjecWizard;
const ConsoleUI = require('../../console-ui').ConsoleUI;
const ProjectBuilder = require('./project-builder').ProjectBuilder;

exports.Command = class {
  execute(args) {
    let ui = new ConsoleUI();
    let wizard = new NewProjecWizard(ui);

    wizard.start(args[0]).then(result => {
      let builder = new ProjectBuilder(result);

      builder.build().then(() => {
        console.log(`New Aurelia project "${result.name}" successfully created.`);
      }).catch(error => {
        console.log('There was an error creating the Aurelia project.')
        console.error(error);
      });
    });
  }
}
