'use strict';
const os = require('os');
const { prompt } = require('enquirer');
const Enquirer = require('enquirer');
const colors = require("ansi-colors");
const transform = require('./colors/transform');
const createLines = require('./string').createLines;

module.exports = class {
  constructor(ui) {
    this.ui = ui;
  }

  async prompt(type, name, question, initial, options, autoSubmit) {
    const choices = options && options[0].displayName ? this.convertOptions(options) : options;
    const enquirer = new Enquirer();
    if (autoSubmit) {
      enquirer.answers[name] = initial;
    }
    const answers = await enquirer.prompt({
      type: type,
      name: name,
      message: question,
      initial: initial,
      choices: choices,
      styles: {
        em: colors.cyan,
      },
      separator: ' ' + (autoSubmit ? transform(` <cyan>${initial}</cyan>`) : ''),
      header: ' ',
      footer: ' ',
      choicesHeader: ' ',
      onSubmit() {
        if (type === 'multiselect' && this.selected.length === 0) {
          this.enable(this.focused);
        }
      },
      autofill: autoSubmit ? 'show' : false,
    });
    if (type === 'multiselect') {
      return (options && options[0].displayName ? answers[name].map((option) => this.findValue(options, option)) : answers[name]) || [];
    }
    else {
      return (options && options[0].displayName) || autoSubmit ? this.findValue(options, answers[name]) : answers[name];
    }
  }

  convertOptions(options) {
    return options.map((option, index, options) => {
      return {
        // name: option.value,
        value: option.displayName,
        message: `${index}. ${option.displayName}`,
        hint: os.EOL + transform(`<gray>${createLines(option.description, '     ', this.ui.getWidth())}</gray>`),
      }
    });
  }
  findValue(options, displayName) {
    return options.find((option) => option.displayName === displayName).value;
  }
};
