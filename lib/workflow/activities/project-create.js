"use strict";
const os = require('os');
const ProjectTemplate = require('../../commands/new/project-template').ProjectTemplate;
const UI = require('../../ui').UI;
const transform = require('../../colors/transform');

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
      markupProcessor: context.state.markupProcessor,
      cssProcessor: context.state.cssProcessor,
      editor: context.state.editor
    };

    return this.ui.clearScreen()
      .then(() => this.ui.log(this.createProjectDescription(model)))
      .then(() => {
        return this.ui.question('Would you like to create this project?', [
          {
            displayName: 'Yes',
            description: 'Creates the project structure based on your selections.',
            value: 'yes'
          },
          {
            displayName: 'No',
            description: 'Aborts the new project wizard.',
            value: 'no'
          }
        ])
      }).then(answer => {
        if (answer.value == 'yes') {
          let project = context.state.project = new ProjectTemplate(model);

          let configurePlatform = require(`../../commands/new/platforms/${model.platform.id}`);
          configurePlatform(project);

          let configureTranspiler = require(`../../commands/new/transpilers/${model.transpiler.id}`);
          configureTranspiler(project);

          let configureMarkupProcessor = require(`../../commands/new/markup-processors/${model.markupProcessor.id}`);
          configureMarkupProcessor(project);

          let configureCSSProcessor = require(`../../commands/new/css-processors/${model.cssProcessor.id}`);
          configureCSSProcessor(project);

          let configureEditor = require(`../../commands/new/editors/${model.editor.id}`);
          configureEditor(project);

          return project.create(process.cwd())
            .then(() => this.ui.clearScreen())
            .then(() => this.ui.log('Project structure created and configured.'))
            .then(() => context.next(this.nextActivity));
        }

        return this.ui.log(os.EOL + 'Project creation aborted.')
          .then(() => context.next());
      });
  }

  createProjectDescription(model) {
    let text = os.EOL + 'Project Configuration' + os.EOL + os.EOL;

    text += `<magenta><bold>Name: </bold></magenta>${model.name}` + os.EOL;
    text += `<magenta><bold>Platform: </bold></magenta>${model.platform.displayName}` + os.EOL;
    text += `<magenta><bold>Transpiler: </bold></magenta>${model.transpiler.displayName}` + os.EOL;
    text += `<magenta><bold>CSS Processor: </bold></magenta>${model.cssProcessor.displayName}` + os.EOL;
    text += `<magenta><bold>Editor: </bold></magenta>${model.editor.displayName}` + os.EOL;

    return transform(text);
  }
}
