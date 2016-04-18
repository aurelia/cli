"use strict";
const readline = require('readline');
const os = require("os");
const fs = require('fs');

function interpretAnswer(answer, options) {
  let comparableOptions = options.map(x => x.toLowerCase());
  let finalAnswer = options[0];

  if (answer) {
    if (comparableOptions.indexOf(answer.toLowerCase()) !== -1) {
      finalAnswer = answer;
    } else {
      let num = parseInt(answer);
      finalAnswer = options[num - 1] || options[0];
    }
  }

  return finalAnswer.toLowerCase();
}

function createOptionsText(options) {
  let text = os.EOL;

  for(let i = 0; i < options.length; ++i) {
    text += `${i + 1}. ${options[i]}`;

    if (i == 0) {
      text += ' (Default)';
    }

    text += os.EOL;
  }

  return text;
}

exports.ConsoleUI = class {
  open() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  close() {
    this.rl.close();
  }

  write(text) {
    console.log(text);
  }

  question(text, options) {
    return new Promise((resolve, reject) => {
      if (options) {
        let comparableOptions = options.map(x => x.toLowerCase());
        let fullText = text + createOptionsText(options) + ': ';

        this.rl.question(fullText, answer => {
          resolve(interpretAnswer(answer, options));
        });
      } else {
        this.rl.question(text + os.EOL +': ', answer => {
          if (answer) {
            resolve(answer);
          } else {
            return this.question(text, options).then(answer => resolve(answer));
          }
        });
      }
    });
  }

  displayLogo() {
    return new Promise((resolve, reject) => {
      let logoLocation = require.resolve('./resources/logo.txt');

      fs.readFile(logoLocation, (error, logo) => {
        if(error) reject(error);
        else {
          let lines = process.stdout.getWindowSize()[1];
          for(var i = 0; i < lines; i++) {
            console.log('\r\n');
          }

          console.log(logo.toString());

          resolve();
        }
      });
    });
  }
}
