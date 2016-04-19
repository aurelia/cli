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

    let configurePlatform = require(`../../commands/new/platforms/${model.platform}/index`);
    configurePlatform(project);

    let configureTranspiler = require(`../../commands/new/transpilers/${model.transpiler}/index`);
    configureTranspiler(project);

    let configureCSSProcessor = require(`../../commands/new/css-processors/${model.cssProcessor}/index`);
    configureCSSProcessor(project);

    let configureEditor = require(`../../commands/new/editors/${model.editor}/index`);
    configureEditor(project);

    this.ui.log(`Creating project "${model.name}"`);

    return project.create(process.cwd())
      .then(() => this.ui.log('Project resources successfully created.'))
      .then(() => context.next(this.nextActivity));
  }
}
