"use strict";
const readline = require('readline');
const os = require("os");
const fs = require('./file-system');
const transform = require('./colors/transform');

exports.UI = class {}

exports.ConsoleUI = class {
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

  question(text, options) {
    return new Promise((resolve, reject) => {
      if (options) {
        let fullText = os.EOL + text + os.EOL
          + createOptionsText(options) + os.EOL + '> ';

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
    let logoLocation = require.resolve('./resources/logo.txt');

    return fs.readFile(logoLocation).then(logo => {
      let lines = this.getHeight();

      for(var i = 0; i < lines; i++) {
        console.log('\r\n');
      }

      console.log(logo.toString());
    });
  }
}

function createOptionsText(options) {
  let text = os.EOL;

  for(let i = 0; i < options.length; ++i) {
    text += `${i + 1}. ${options[i].displayName}`;

    if (i == 0) {
      text += ' (Default)';
    }

    text += os.EOL;
    text += `   <dim>${options[i].description}</dim>`;
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
