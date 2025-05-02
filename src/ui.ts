import { CLIOptions } from './cli-options';

import * as os from 'node:os';
import { readFile } from './file-system';
import { wordWrap } from 'enquirer/lib/utils.js';
import { getTtySize } from './get-tty-size';
import { prettyChoices } from './pretty-choices';
import { Writable } from 'node:stream';
import * as _ from 'lodash';

// type definitions for `enquirer` are very bad, we need to mock them.
declare module 'enquirer' {
  /** [class Input extends StringPrompt] */
  export const Input;
  /** [class SelectPrompt extends ArrayPrompt] */
  export const Select;
}
import { Input, Select } from 'enquirer';

/** Base class, used for DI registration of `ConsoleUI` */
export abstract class UI {
  public abstract displayLogo(): Promise<void>;
  public abstract log(text: string, indent?: number): Promise<void>;
  public abstract getWidth(): number;
  public abstract getHeight(): number;
  public abstract ensureAnswer(answer: string, question: string, suggestion?: string)
}

export class ConsoleUI implements UI {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static UI(UI: unknown, ui: unknown) {
    throw new Error('Method not implemented.');
  }
  private readonly cliOptions: CLIOptions;
  static ConsoleUI: ConsoleUI;

  constructor(cliOptions: CLIOptions) {
    this.cliOptions = cliOptions;
  }

  public log(text: string, indent?: number) {
    if (indent !== undefined) {
      text = wordWrap(text, {indent, width: this.getWidth()});
    }
    return new Promise<void>(resolve  => {
      console.log(text);
      resolve();
    });
  }

  ensureAnswer(answer: string, question: string, suggestion?: string) {
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
  private async _question(question, options, defaultValue, _debug = []) {
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
  private async _multiselect(question, options, _debug = []) {
    options = options.filter(x => includeOption(this.cliOptions, x));

    const opts = {
      multiple: true,
      message: question,
      choices: prettyChoices(options),
      validate: results => results.length === 0 ? 'Need at least one selection' : true,
      // https://github.com/enquirer/enquirer/issues/121#issuecomment-468413408
      result(names) {
        return Object.values(this.map(names));
      },
      stdout: undefined
    };

    if (_debug && _debug.length) {
      // Silent output in debug mode
      opts.stdout = new Writable({write(c, e, cb) {cb();}});
    }

    return await _run(new Select(opts), _debug);
  }

  public getWidth() {
    return getTtySize().width;
  }

  public getHeight() {
    return getTtySize().height;
  }

  async displayLogo() {
    if (this.getWidth() < 50) {
      return this.log('Aurelia CLI' + os.EOL);
    }

    const logoLocation = require.resolve('./resources/logo.txt');

    const logo = await readFile(logoLocation);
    void this.log(logo.toString());
  }
};

function includeOption(cliOptions: CLIOptions, option: { disabled?: boolean; flag?: string }) {
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
