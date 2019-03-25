const UI = require('../../ui').UI;
const fs = require('../../file-system');
const _ = require('lodash');
const CLIOptions = require('../../cli-options').CLIOptions;
const logger = require('aurelia-logging').getLogger('generate-skeletons');
const selectFeatures = require('../../workflow/select-features');
const writeProject = require('../../workflow/write-project');

// Designed to cover all unit/e2e/transpiler combinations.
// Cover decent css/postcss/htmlmin combinations.
const projectDefs = [
  'cli-bundler sass htmlmin-min jest dotnet-core protractor scaffold-navigation',
  'cli-bundler less htmlmin-min jest protractor',
  'cli-bundler karma dotnet-core protractor',
  'cli-bundler karma postcss-typical protractor vscode',
  'cli-bundler typescript jest dotnet-core protractor scaffold-navigation',
  'cli-bundler htmlmin-max typescript jest protractor',
  'cli-bundler typescript karma dotnet-core protractor',
  'cli-bundler typescript karma protractor scaffold-navigation',

  'cli-bundler stylus jest dotnet-core cypress scaffold-navigation',
  'cli-bundler htmlmin-max jest cypress',
  'cli-bundler htmlmin-min karma dotnet-core cypress scaffold-navigation',
  'cli-bundler less htmlmin-min postcss-typical postcss-basic karma cypress scaffold-navigation',
  'cli-bundler typescript jest dotnet-core cypress',
  'cli-bundler typescript jest cypress',
  'cli-bundler typescript karma dotnet-core cypress scaffold-navigation vscode',
  'cli-bundler sass htmlmin-max typescript karma cypress',

  'cli-bundler alameda jest dotnet-core protractor',
  'cli-bundler alameda jest protractor scaffold-navigation',
  'cli-bundler alameda htmlmin-max karma dotnet-core protractor',
  'cli-bundler alameda karma protractor',
  'cli-bundler alameda htmlmin-min typescript jest dotnet-core protractor',
  'cli-bundler alameda htmlmin-min typescript jest protractor',
  'cli-bundler alameda typescript postcss-basic karma dotnet-core protractor',
  'cli-bundler alameda typescript karma protractor',

  'cli-bundler alameda jest dotnet-core cypress',
  'cli-bundler alameda jest cypress',
  'cli-bundler alameda karma dotnet-core cypress',
  'cli-bundler alameda karma cypress scaffold-navigation',
  'cli-bundler alameda stylus typescript jest dotnet-core cypress',
  'cli-bundler alameda less postcss-basic typescript jest cypress',
  'cli-bundler alameda htmlmin-min typescript karma dotnet-core cypress',
  'cli-bundler alameda htmlmin-min typescript karma cypress',

  'cli-bundler htmlmin-max systemjs jest dotnet-core protractor',
  'cli-bundler systemjs jest protractor',
  'cli-bundler systemjs karma dotnet-core protractor',
  'cli-bundler systemjs htmlmin-max karma protractor',
  'cli-bundler systemjs sass typescript jest dotnet-core protractor scaffold-navigation',
  'cli-bundler systemjs typescript jest protractor',
  'cli-bundler systemjs typescript karma dotnet-core protractor',
  'cli-bundler systemjs stylus typescript karma protractor',

  'cli-bundler systemjs jest dotnet-core cypress',
  'cli-bundler systemjs jest cypress',
  'cli-bundler systemjs stylus karma dotnet-core cypress scaffold-navigation',
  'cli-bundler systemjs sass karma postcss-typical cypress',
  'cli-bundler systemjs typescript jest dotnet-core cypress',
  'cli-bundler systemjs htmlmin-max typescript jest cypress',
  'cli-bundler systemjs htmlmin-max typescript karma dotnet-core cypress',
  'cli-bundler systemjs typescript karma cypress',

  'webpack htmlmin-min jest dotnet-core protractor vscode',
  'webpack http2 less jest protractor scaffold-navigation',
  'webpack htmlmin-max karma dotnet-core protractor',
  'webpack http2 karma postcss-typical protractor',
  'webpack sass htmlmin-min typescript jest dotnet-core protractor',
  'webpack typescript postcss-basic jest protractor',
  'webpack stylus htmlmin-max typescript karma dotnet-core protractor scaffold-navigation',
  'webpack less typescript karma protractor',

  'webpack stylus jest postcss-basic dotnet-core cypress',
  'webpack htmlmin-max jest cypress',
  'webpack karma dotnet-core cypress scaffold-navigation',
  'webpack htmlmin-min karma cypress',
  'webpack typescript jest dotnet-core cypress',
  'webpack http2 htmlmin-max typescript jest cypress scaffold-navigation',
  'webpack http2 sass typescript postcss-typical karma dotnet-core cypress scaffold-navigation vscode',
  'webpack htmlmin-min typescript karma cypress'
];

module.exports = class {
  static inject() { return [UI, CLIOptions]; }

  constructor(ui, options) {
    this.ui = ui;
    this.options = options;
  }

  async execute() {
    let defs = projectDefs;
    if (this.options.hasFlag('definitions')) {
      const file = this.options.getFlagValue('definitions');
      defs = (await fs.readFile(file)).split(/(?:\r|\n)+/);
      defs = _(defs).map(_.trim).compact().value();
    }
    for (let i = 0, ii = defs.length; i < ii; i++) {
      let features = _(defs[i].split(' ')).map(_.trim).compact().value();
      // Cleanup feature set, and fillup default.
      features = await selectFeatures(features, {unattended: true});
      const projectName = features.join('_');

      logger.info(`Writing ${i + 1}/${ii} ${projectName}`);
      await writeProject(projectName, features, projectName, true);
    }

    logger.info('Created all projects');
  }
};
