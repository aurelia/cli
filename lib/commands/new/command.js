"use strict";
const NewProjecWizard = require('./new-project-wizard').NewProjecWizard;
const ConsoleUI = require('../../console-ui').ConsoleUI;
const ProjectBuilder = require('./project-builder').ProjectBuilder;

exports.Command = class {
  execute(args) {
    let ui = new ConsoleUI();
    let wizard = new NewProjecWizard(ui);

    return wizard.start(args[0]).then(result => {
      let builder = new ProjectBuilder(result);
      return builder.build()
    }).then(project => {
      console.log(`New Aurelia project "${project.name}" successfully created.`);
    }).catch(error => {
      console.log('There was an error creating the Aurelia project.')
      console.error(error);
    });
  }
}
