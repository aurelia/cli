"use strict";
const readline = require('readline');
const os = require("os");

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
    text += `${i + 1}. ${options[i]} ${os.EOL}`;
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

  write(text) {
    console.log(text);
  }

  question(text, options) {
    return new Promise((resolve, reject) => {
      if (options) {
        let comparableOptions = options.map(x => x.toLowerCase());
        let fullText = text + createOptionsText(comparableOptions) + ': ';

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

  close() {
    this.rl.close();
  }
}
