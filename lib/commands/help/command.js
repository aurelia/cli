"use strict";
const fs = require('fs');
const transform = require('../../colors/transform');
const os = require("os");
const UI = require('../../ui').UI;
const CLIOptions = require('../../cli').CLIOptions;
const Optional = require('aurelia-dependency-injection').Optional;
const Project = require('../../project').Project;

module.exports = class {
  static inject() { return [CLIOptions, UI, Optional.of(Project)]; };

  constructor(options, ui, project) {
    this.options = options;
    this.ui = ui;
    this.project = project;
  }

  execute(args) {
    return this.ui.displayLogo().then(() => {
      if (this.options.runningGlobally) {
        this.ui.log(this.getGlobalCommandText());
      } else {
        return this.getLocalCommandText().then(text => {
          this.ui.log(text);
        });
      }
    });
  }

  getGlobalCommandText() {
    return buildTextFromCommands([
      require('../new/command.json'),
      require('./command.json')
    ]);
  }

  getLocalCommandText() {
    let commands = [
      require('../generate/command.json'),
      require('./command.json')
    ];

    return this.project.getTaskHelpFiles().then(localCommands => {
      return buildTextFromCommands(localCommands.concat(commands));
    });
  }
}

function buildTextFromCommands(commands) {
  let text = '';
  commands.forEach(json => text += transformCommandToStyledText(json));
  return text;
}

function transformCommandToStyledText(json) {
  const tab = '    ';
  let text = `<magenta><bold>${json.name}</bold></magenta>`;

  if (json.parameters) {
    json.parameters.forEach(parameter => {
      if (parameter.optional) {
        text += ' <dim><' + parameter.name + '></dim>';
      } else {
        text += ' ' + parameter.name;
      }
    });
  }

  text += os.EOL + os.EOL;
  text += tab + json.description;

  if (json.parameters) {
    json.parameters.forEach(parameter => {
      text += os.EOL + os.EOL;
      text += '<blue>' + tab + parameter.name;

      if (parameter.optional) {
        text += ' (optional)'
      }

      text += '</blue> - ' + parameter.description;
    });
  }

  text += os.EOL + os.EOL;

  return transform(text);
}
