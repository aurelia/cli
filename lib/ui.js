"use strict";
const readline = require('readline');
const os = require("os");
const fs = require('./file-system');
const transform = require('./colors/transform');
const createLines = require('./string').createLines;
const tty = require('tty');

exports.UI = class {}

exports.ConsoleUI = class {
  constructor(cliOptions) {
    this.cliOptions = cliOptions;
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
    })
  }

  ensureAnswer(answer, question, suggestion) {
    if (answer) {
      return Promise.resolve(answer);
    }

    return this.question(question, suggestion);
  }

  question(text, optionsOrSuggestion) {
    return new Promise((resolve, reject) => {
      if (!optionsOrSuggestion || typeof optionsOrSuggestion === 'string') {
        this.open();

        let fullText = os.EOL + text + os.EOL + os.EOL;

        if (optionsOrSuggestion) {
          fullText += '[' + optionsOrSuggestion + ']';
        }

        this.rl.question(fullText + '> ', answer => {
          this.close();

          answer = answer || optionsOrSuggestion;

          if (answer) {
            resolve(answer);
          } else {
            return this.question(text, optionsOrSuggestion).then(answer => resolve(answer));
          }
        });
      } else {
        optionsOrSuggestion = optionsOrSuggestion.filter(x => includeOption(this.cliOptions, x));

        if (optionsOrSuggestion.length === 1) {
          return resolve(optionsOrSuggestion[0]);
        }

        let defaultOption = optionsOrSuggestion[0];
        let fullText = os.EOL + text + os.EOL
          + createOptionsText(this, optionsOrSuggestion) + os.EOL + '[' + defaultOption.displayName + ']' + '> ';

        this.open();
        this.rl.question(fullText, answer => {
          this.close();
          resolve(interpretAnswer(answer, optionsOrSuggestion));
        });
      }
    });
  }

  getWidth() {
    return getWindowSize().width;
  }

  getHeight() {
    return getWindowSize().height;
  }

  displayLogo() {
    this.clearScreen();

    if (this.getWidth() < 50) {
      return this.log('Aurelia CLI' + os.EOL);
    } else {
      let logoLocation = require.resolve('./resources/logo.txt');

      return fs.readFile(logoLocation).then(logo => {
        console.log(logo.toString());
      });
    }
  }

  clearScreen() {
    //let lines = this.getHeight();

    //for(var i = 0; i < lines; i++) {
    //  console.log('\r\n');
    //}

    return Promise.resolve();
  }
}

function includeOption(cliOptions, option) {
  if (option.disabled) {
    return false;
  }

  if (option.flag) {
    return cliOptions.hasFlag(option.flag);
  }

  return true;
}

function createOptionsText(ui, options) {
  let text = os.EOL;

  for(let i = 0; i < options.length; ++i) {
    text += `${i + 1}. ${options[i].displayName}`;

    if (i == 0) {
      text += ' (Default)';
    }

    text += os.EOL;
    text += createLines(`<dim>${options[i].description}</dim>`, '   ', ui.getWidth());
    text += os.EOL;
  }

  return transform(text);
}

function interpretAnswer(answer, options) {
  if (!answer) {
    return options[0];
  }

  let lowerCasedAnswer = answer.toLowerCase();
  let found = options.find(x => x.displayName.toLowerCase().startsWith(lowerCasedAnswer));

  if (found) {
    return found;
  }

  let num = parseInt(answer);
  return options[num - 1] || options[0];
}

function getWindowSize() {
  var width;
  var height;

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

  return {height: height, width: width};
}
