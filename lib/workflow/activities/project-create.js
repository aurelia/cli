"use strict";
const ProjectTemplate = require('../../commands/new/project-template').ProjectTemplate;
const UI = require('../../ui').UI;

module.exports = class {
  static inject() { return [UI]; }

  constructor(ui) {
    this.ui = ui;
  }

  execute(context) {
    let model = {
      name: context.state.name,
      type: context.state.type,
      platform: context.state.platform,
      transpiler: context.state.transpiler,
      cssProcessor: context.state.cssProcessor,
      editor: context.state.editor
    };

    let project = context.state.project = new ProjectTemplate(model);

    let configurePlatform = require(`../../commands/new/platforms/${model.platform.id}`);
    configurePlatform(project);

    let configureTranspiler = require(`../../commands/new/transpilers/${model.transpiler.id}`);
    configureTranspiler(project);

    let configureCSSProcessor = require(`../../commands/new/css-processors/${model.cssProcessor.id}`);
    configureCSSProcessor(project);

    let configureEditor = require(`../../commands/new/editors/${model.editor.id}`);
    configureEditor(project);

    this.ui.log(`Creating project "${model.name}"`)
      .then(() => project.create(process.cwd()))
      .then(() => this.ui.log('Project resources successfully created.'))
      .then(() => context.next(this.nextActivity));
  }
}
