const os = require('os');
const fs = require('./file-system');
const {wordWrap} = require('enquirer/lib/utils');
const getTtySize = require('./get-tty-size');
const {Input, Select} = require('enquirer');
const prettyChoices = require('./workflow/pretty-choices');
const {Writable} = require('stream');
const _ = require('lodash');

exports.UI = class { };

exports.ConsoleUI = class {
  constructor(cliOptions) {
    this.cliOptions = cliOptions;
  }

  log(text, indent) {
    if (indent !== undefined) {
      text = wordWrap(text, {indent, width: this.getWidth()});
    }
    return new Promise((resolve, reject) => {
      console.log(text);
      resolve();
    });
  }

  ensureAnswer(answer, question, suggestion) {
    return this._ensureAnswer(answer, question, suggestion);
  }

  // _debug is used to pass in answers for prompts.
  async _ensureAnswer(answer, question, suggestion, _debug = []) {
    if (answer) return answer;
    return await this._question(question, suggestion, undefined, _debug);
  }

  question(question, options, defaultValue) {
    return this._question(question, options, defaultValue);
  }

  // _debug is used to pass in answers for prompts.
  async _question(question, options, defaultValue, _debug = []) {
    let opts;
    let PromptType;
    if (!options || typeof options === 'string') {
      opts = {
        message: question,
        initial: options || '',
        result: r => r.trim(),
        validate: r => _.trim(r) ? true : 'Please provide an answer'
      };
      PromptType = Input;
    } else {
      options = options.filter(x => includeOption(this.cliOptions, x));

      if (options.length === 1) {
        return options[0].value || options[0].displayName;
      }

      opts = {
        type: 'select',
        name: 'answer',
        message: question,
        initial: defaultValue || options[0].value || options[0].displayName,
        choices: prettyChoices(options),
        // https://github.com/enquirer/enquirer/issues/121#issuecomment-468413408
        result(name) {
          return this.map(name)[name];
        }
      };
      PromptType = Select;
    }

    if (_debug && _debug.length) {
      // Silent output in debug mode
      opts.stdout = new Writable({write(c, e, cb) {cb();}});
    }

    return await _run(new PromptType(opts), _debug);
  }

  multiselect(question, options) {
    return this._multiselect(question, options);
  }

  // _debug is used to pass in answers for prompts.
  async _multiselect(question, options, _debug = []) {
    options = options.filter(x => includeOption(this.cliOptions, x));

    const opts = {
      multiple: true,
      message: question,
      choices: prettyChoices(options),
      validate: results => results.length === 0 ? 'Need at least one selection' : true,
      // https://github.com/enquirer/enquirer/issues/121#issuecomment-468413408
      result(names) {
        return Object.values(this.map(names));
      }
    };

    if (_debug && _debug.length) {
      // Silent output in debug mode
      opts.stdout = new Writable({write(c, e, cb) {cb();}});
    }

    return await _run(new Select(opts), _debug);
  }

  getWidth() {
    return getTtySize().width;
  }

  getHeight() {
    return getTtySize().height;
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

async function _run(prompt, _debug = []) {
  if (_debug && _debug.length) {
    prompt.once('run', async() => {
      for (let d = 0, dd = _debug.length; d < dd; d++) {
        let debugChoice = _debug[d];

        if (typeof debugChoice === 'number') {
          // choice index is 1-based.
          while (debugChoice-- > 0) {
            if (debugChoice) {
              await prompt.keypress(null, {name: 'down'});
            } else {
              await prompt.submit();
            }
          }
        } else if (typeof debugChoice === 'string') {
          for (let i = 0, ii = debugChoice.length; i < ii; i++) {
            await prompt.keypress(debugChoice[i]);
          }
          await prompt.submit();
        } else if (typeof debugChoice === 'function') {
          await debugChoice(prompt);
        }
      }
    });
  }

  return await prompt.run();
}
