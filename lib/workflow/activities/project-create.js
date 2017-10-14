'use strict';
const os = require('os');
const ProjectTemplate = require('../../commands/new/project-template').ProjectTemplate;
const UI = require('../../ui').UI;
const transform = require('../../colors/transform');
const CLIOptions = require('../../cli-options').CLIOptions;
const fs = require('../../file-system');
const logger = require('aurelia-logging').getLogger('ProjectCreation');

module.exports = class {
  static inject() { return [UI, CLIOptions]; }

  constructor(ui, options) {
    this.ui = ui;
    this.options = options;
  }

  execute(context) {
    let model = {
      name: context.state.name,
      type: context.state.type,
      bundler: context.state.bundler,
      build: context.state.build,
      platform: context.state.platform,
      targets: context.state.targets,
      loader: context.state.loader,
      transpiler: context.state.transpiler,
      markupProcessor: context.state.markupProcessor,
      cssProcessor: context.state.cssProcessor,
      editor: context.state.editor
    };

    if (context.state.unitTestRunner) {
      model.unitTestRunner = context.state.unitTestRunner;
    }

    if (context.state.integrationTestRunner) {
      model.integrationTestRunner = context.state.integrationTestRunner;
    }

    let project = context.state.project = new ProjectTemplate(model, this.options, this.ui);

    return this.ui.clearScreen()
      .then(() => this.ui.log(this.createProjectDescription(model)))
      .then(() => this.projectConfirmation(project))
      .then(answer => {
        if (answer.value === 'yes') {
          let configurator = require(`../../commands/new/buildsystems/${model.bundler.id}`);
          configurator(project, this.options);

          return project.create(this.ui, this.options.hasFlag('here') ? undefined : process.cwd())
            .then(() => this.ui.clearScreen())
            .then(() => this.ui.log('Project structure created and configured.' + os.EOL))
            .then(() => project.renderManualInstructions())
            .then(() => context.next(this.nextActivity));
        } else if (answer.value === 'restart') {
          return context.next(this.restartActivity);
        }

        return this.ui.log(os.EOL + 'Project creation aborted.')
          .then(() => context.next());
      })
      .catch(e => {
        logger.error(`Failed to create the project due to an error: ${e.message}`);
        logger.info(e.stack);
      });
  }

  createProjectDescription(model) {
    let text = os.EOL + 'Project Configuration' + os.EOL + os.EOL;

    let targets = (model.targets ? model.targets.map((value => value.displayName)).join(', ') : model.platform.displayName);

    text += `    <magenta><bold>Name: </bold></magenta>${model.name}` + os.EOL;
    text += `    <magenta><bold>Platform(s): </bold></magenta>${targets} ${!model.targets ? '(legacy configuration)' : ''}` + os.EOL;
    text += `    <magenta><bold>Bundler: </bold></magenta>${model.bundler.displayName}` + os.EOL;
    if (model.loader) {
      text += `    <magenta><bold>Loader: </bold></magenta>${model.loader.displayName}` + os.EOL;
    }
    text += `    <magenta><bold>Transpiler: </bold></magenta>${model.transpiler.displayName}` + os.EOL;
    text += `    <magenta><bold>Markup Processor: </bold></magenta>${model.markupProcessor.displayName}` + os.EOL;
    text += `    <magenta><bold>CSS Processor: </bold></magenta>${model.cssProcessor.displayName}` + os.EOL;

    if (model.unitTestRunner) {
      let testRunners = model.unitTestRunner instanceof Array ? model.unitTestRunner : [model.unitTestRunner];
      for (let i = 0; i < testRunners.length; i++) {
        text += `    <magenta><bold>Unit Test Runner: </bold></magenta>${testRunners[i].displayName}` + os.EOL;
      }
    }

    if (model.integrationTestRunner) {
      text += `    <magenta><bold>Integration Test Runner: </bold></magenta>${model.integrationTestRunner.displayName}` + os.EOL;
    }

    text += `    <magenta><bold>Editor: </bold></magenta>${model.editor.displayName}` + os.EOL;

    return transform(text);
  }

  projectConfirmation(project) {
    let question = 'Would you like to create this project?';
    let yesDescription = 'Creates the project structure based on your selections.';

    if (!this.options.hasFlag('here') && fs.existsSync(project.root.name)) {
      question = transform(`<red><bold>WARNING:</bold></red> The '${project.root.name}' folder already exists. Would you like to create the project in this folder?`);
      yesDescription = transform(`Creates the project structure based on your selections <red><bold>even though the '${project.root.name}' directory already exists</bold></red>`);
    } else if (this.options.hasFlag('here') && fs.readdirSync(process.cwd()).length > 0) {
      question = transform('<red><bold>WARNING:</bold></red> The current directory is not empty. Would you like to create the project in this folder?');
      yesDescription = transform('Creates the project structure based on your selections <red><bold>even though the current directory is not empty</bold></red>');
    }

    return this.ui.question(question, [
      {
        displayName: 'Yes',
        description: yesDescription,
        value: 'yes'
      },
      {
        displayName: 'Restart',
        description: 'Restarts the wizard, allowing you to make different selections.',
        value: 'restart'
      },
      {
        displayName: 'Abort',
        description: 'Aborts the new project wizard.',
        value: 'abort'
      }
    ]);
  }
};
