const {wordWrap} = require('enquirer/lib/utils');
const getTtySize = require('../get-tty-size');

// Check all values, indent hint line.
module.exports = function(...choices) {
  if (choices.length && Array.isArray(choices[0])) {
    choices = choices[0];
  }
  return choices.map((c, idx) => {
    // for {role: 'separator'}
    if (c.role) return c;

    // displayName and description are for compatibility in lib/ui.js
    const value = c.value || c.displayName;
    const message = c.message || c.displayName;
    const hint = c.hint || c.description;

    if (typeof value !== 'string') {
      throw new Error(`Value type ${typeof value} is not supported. Only support string value.`);
    }

    const choice = {
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
