import { wordWrap } from 'enquirer/lib/utils.js';
import { getTtySize } from './get-tty-size';

interface Choice {
  name: string
  message?: string
  value?: unknown
  hint?: string
  role?: string
  enabled?: boolean
  disabled?: boolean | string
}

/**
 * displayName and description are for compatibility in lib/ui.js
 */
interface ChoiceEx extends Choice {
  title?: string;
  displayName?: string;
  description?: string;
  /** used by lib/workflow/run-questionnaire */
  if?: boolean;
  initial?: string;
  type?: string;
}

// Check all values, indent hint line.
export function prettyChoices(...choices: ChoiceEx[]) {
  if (choices.length && Array.isArray(choices[0])) {
    choices = choices[0];
  }
  return choices.map(c => {
    // for {role: 'separator'}
    if (c.role) return c;

    // displayName and description are for compatibility in lib/ui.js
    const value = c.value || c.displayName;
    const message = c.title || c.message || c.displayName;
    const hint = c.hint || c.description;

    if (typeof value !== 'string') {
      throw new Error(`Value type ${typeof value} is not supported. Only support string value.`);
    }

    const choice: ChoiceEx = {
      value: value,
      // TODO after https://github.com/enquirer/enquirer/issues/115
      // add ${idx + 1}. in front of message
      message: message,
      // https://github.com/enquirer/enquirer/issues/121
      name: c.message,
      if: c.if // used by lib/workflow/run-questionnaire
    };

    if (hint) {
      // indent hint, need to adjust indent after ${idx + 1}. was turned on
      choice.hint = '\n' + wordWrap(hint, {indent: '  ', width: getTtySize().width});
    }

    return choice;
  });
};
