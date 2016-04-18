"use strict";
const fs = require('fs');
const transform = require('../../colors/transform');
const os = require("os");
const ConsoleUI = require('../../console-ui').ConsoleUI;

exports.Command = class {
  constructor(options) {
    this.options = options;
    this.ui = new ConsoleUI();
  }

  execute(args) {
    return this.ui.displayLogo().then(() => {
      if (this.options.runningGlobally) {
        console.log(this.getGlobalCommandText());
      } else {
        console.log(this.getLocalCommandText());
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
    return buildTextFromCommands([
      require('./command.json')
    ]);
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
