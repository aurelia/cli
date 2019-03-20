const UI = require('../../ui').UI;
const CLIOptions = require('../../cli-options').CLIOptions;
const Optional = require('aurelia-dependency-injection').Optional;
const Project = require('../../project').Project;
const string = require('../../string');

module.exports = class {
  static inject() { return [CLIOptions, UI, Optional.of(Project)]; }

  constructor(options, ui, project) {
    this.options = options;
    this.ui = ui;
    this.project = project;
  }

  execute(args) {
    return this.ui.displayLogo()
      .then(() => {
        if (this.options.runningGlobally) {
          return this.getGlobalCommandText();
        }

        return this.getLocalCommandText();
      }).then(text => this.ui.log(text));
  }

  getGlobalCommandText() {
    return string.buildFromMetadata([
      require('../new/command.json'),
      require('./command.json')
    ], this.ui.getWidth());
  }

  getLocalCommandText() {
    const commands = [
      require('../generate/command.json'),
      require('../config/command.json'),
      require('./command.json')
    ];

    return this.project.getTaskMetadata().then(metadata => {
      return string.buildFromMetadata(metadata.concat(commands), this.ui.getWidth());
    });
  }
};
