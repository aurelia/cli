'use strict';
const readline = require('readline');
const os = require('os');
const fs = require('./file-system');
const transform = require('./colors/transform');
const createLines = require('./string').createLines;
const tty = require('tty');
const UIEnquirer = require('./ui-enquirer');

exports.UI = class { };

exports.ConsoleUI = class {
  constructor(cliOptions) {
    this.cliOptions = cliOptions;
    this.uiEnquirer = new UIEnquirer(this);
  }

  open() {
    if (this.rl) {
      return;
    }

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  close() {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }

  log(text) {
    return new Promise((resolve, reject) => {
      console.log(text);
      resolve();
    });
  }

  ensureAnswer(answer, question, suggestion) {
    if (answer) {
      return Promise.resolve(answer);
    }

    return this.question(question, suggestion);
  }

  async question(question, optionsOrSuggestion, defaultValue) {
    if (!optionsOrSuggestion || typeof optionsOrSuggestion === 'string') {
      const answer = await this.uiEnquirer.prompt(
        'input',
        'noNameNeeded',
        question,
        optionsOrSuggestion,
      );
      if (answer && answer.length) {
        return answer;
      } else {
        return this.question(question, optionsOrSuggestion);
      }
    } else {
      optionsOrSuggestion = optionsOrSuggestion.filter(x => includeOption(this.cliOptions, x));
      let autoSubmit = false;
      if (optionsOrSuggestion.length === 1) {
        defaultValue = optionsOrSuggestion[0].displayName;
        optionsOrSuggestion[0].name = optionsOrSuggestion[0].value.id;
        autoSubmit = true;
      }

      return this.uiEnquirer.prompt(
        'select',
        'noNameNeeded',
        question,
        defaultValue,
        optionsOrSuggestion,
        autoSubmit,
      );
    }
  }

  multiselect(question, options, defaultValue) {
    return this.uiEnquirer.prompt(
      'multiselect',
      'noNameNeeded',
      question,
      defaultValue,
      options
    );
  }

  getWidth() {
    return getWindowSize().width;
  }

  getHeight() {
    return getWindowSize().height;
  }

  displayLogo() {
    if (this.getWidth() < 50) {
      return this.log('Aurelia CLI' + os.EOL);
    }

    let logoLocation = require.resolve('./resources/logo.txt');

    return fs.readFile(logoLocation).then(logo => {
      this.log(logo.toString());
    });
  }
};

function includeOption(cliOptions, option) {
  if (option.disabled) {
    return false;
  }

  if (option.flag) {
    return cliOptions.hasFlag(option.flag);
  }

  return true;
}

function getWindowSize() {
  let width;
  let height;

  if (tty.isatty(1) && tty.isatty(2)) {
    if (process.stdout.getWindowSize) {
      width = process.stdout.getWindowSize(1)[0];
      height = process.stdout.getWindowSize(1)[1];
    } else if (tty.getWindowSize) {
      width = tty.getWindowSize()[1];
      height = tty.getWindowSize()[0];
    } else if (process.stdout.columns && process.stdout.rows) {
      height = process.stdout.rows;
      width = process.stdout.columns;
    }
  } else {
    width = 80;
    height = 100;
  }

  return { height: height, width: width };
}
