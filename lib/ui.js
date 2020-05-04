const os = require('os');
const fs = require('./file-system');
const getTtySize = require('./get-tty-size');

exports.UI = class { };

exports.ConsoleUI = class {
  constructor(cliOptions) {
    this.cliOptions = cliOptions;
  }

  log(text, indent) {
    if (indent !== undefined) {
      text = wordWrap(text, {indent, width: this.getWidth()});
    }
    return new Promise(resolve  => {
      console.log(text);
      resolve();
    });
  }

  getWidth() {
    return getTtySize().width;
  }

  getHeight() {
    return getTtySize().height;
  }

  async displayLogo() {
    if (this.getWidth() < 50) {
      return this.log('Aurelia CLI' + os.EOL);
    }

    let logoLocation = require.resolve('./resources/logo.txt');

    return fs.readFile(logoLocation).then(logo => {
      this.log(logo.toString());
    });
  }
};

// Copied from enquirer/lib/utils.js
function wordWrap(str, options = {}) {
  if (!str) return str;

  if (typeof options === 'number') {
    options = { width: options };
  }

  let { indent = '', newline = ('\n' + indent), width = 80 } = options;
  let spaces = (newline + indent).match(/[^\S\n]/g) || [];
  width -= spaces.length;
  let source = `.{1,${width}}([\\s\\u200B]+|$)|[^\\s\\u200B]+?([\\s\\u200B]+|$)`;
  let output = str.trim();
  let regex = new RegExp(source, 'g');
  let lines = output.match(regex) || [];
  lines = lines.map(line => line.replace(/\n$/, ''));
  if (options.padEnd) lines = lines.map(line => line.padEnd(width, ' '));
  if (options.padStart) lines = lines.map(line => line.padStart(width, ' '));
  return indent + lines.join(newline);
}

exports.wordWrap = wordWrap;
