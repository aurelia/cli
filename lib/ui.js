"use strict";
const readline = require('readline');
const os = require("os");
const fs = require('./file-system');
const transform = require('./colors/transform');
const createLines = require('./string').createLines;

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

  ensureAnswer(answer, question) {
    if (answer) {
      return Promise.resolve(answer);
    }

    return this.question(question);
  }

  question(text, options) {
    return new Promise((resolve, reject) => {
      if (options) {
        options = options.filter(x => includeOption(this.cliOptions, x));

        if (options.length === 1) {
          return resolve(options[0]);
        }

        let fullText = os.EOL + text + os.EOL
          + createOptionsText(this, options) + os.EOL + '> ';

        this.open();
        this.rl.question(fullText, answer => {
          this.close();
          resolve(interpretAnswer(answer, options));
        });
      } else {
        this.open();
        this.rl.question(os.EOL + text + os.EOL + os.EOL +'> ', answer => {
          this.close();

          if (answer) {
            resolve(answer);
          } else {
            return this.question(text, options).then(answer => resolve(answer));
          }
        });
      }
    });
  }

  getWidth() {
    return process.stdout.getWindowSize()[0];
  }

  getHeight() {
    return process.stdout.getWindowSize()[1];
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
    let lines = this.getHeight();

    for(var i = 0; i < lines; i++) {
      console.log('\r\n');
    }

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
  let found = options.find(x => x.displayName.indexOf(lowerCasedAnswer) !== -1);

  if (found) {
    return found;
  }

  let num = parseInt(answer);
  return options[num - 1] || options[0];
}
