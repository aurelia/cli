"use strict";
const WorkflowEngine = require('../../workflow/workflow-engine').WorkflowEngine;
const UI = require('../../ui').UI;
const Container = require('aurelia-dependency-injection').Container;

module.exports = class {
  static inject() { return [Container, UI] };

  constructor(container, ui) {
    this.container = container;
    this.ui = ui;
  }

  execute(args) {
    let definition = require('./new-application.json');
    let engine = new WorkflowEngine(
      definition,
      this.container
    );

    let state = {
      name: args[0]
    };

    return this.ui.displayLogo()
      .then(() => engine.start(state))
      .catch(error => {
        return this.ui.log('There was an error creating the Aurelia project.')
          .then(() => { throw error; });
      });
  }
}
