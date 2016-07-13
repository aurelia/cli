"use strict";
const WorkflowEngine = require('../../workflow/workflow-engine').WorkflowEngine;
const UI = require('../../ui').UI;
const Container = require('aurelia-dependency-injection').Container;
const CLIOptions = require('../../cli-options').CLIOptions;
const path = require('path');

module.exports = class {
  static inject() { return [Container, UI, CLIOptions] };

  constructor(container, ui, options) {
    this.container = container;
    this.ui = ui;
    this.options = options;
  }

  execute(args) {
    let definition = require('./new-application.json');
    let engine = new WorkflowEngine(
      definition,
      this.container
    );

    let state = {};

    if (this.options.hasFlag('here')) {
      state.name = this.options.originalBaseDir;
      state.defaultOrCustomOverride = 'custom';

      if (state.name.indexOf('/') !== -1) {
        let parts = state.name.split('/');
        state.name = parts[parts.length - 1];
      } else if (state.name.indexOf('\\') !== -1) {
        let parts = state.name.split('\\');
        state.name = parts[parts.length - 1];
      }
    } else if(args[0] && !args[0].startsWith('--') && !args[0].startsWith('-')) {
      state.name = args[0];
    }

    return this.ui.displayLogo()
      .then(() => engine.start(state))
      .catch(error => {
        return this.ui.log('There was an error creating the Aurelia project.')
          .then(() => { throw error; });
      });
  }
}
