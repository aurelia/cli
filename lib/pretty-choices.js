"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const utils_js_1 = require("enquirer/lib/utils.js");
const get_tty_size_1 = __importDefault(require("./get-tty-size"));
module.exports = function (...choices) {
    if (choices.length && Array.isArray(choices[0])) {
        choices = choices[0];
    }
    return choices.map(c => {
        // for {role: 'separator'}
        if (c.role)
            return c;
        // displayName and description are for compatibility in lib/ui.js
        const value = c.value || c.displayName;
        const message = c.title || c.message || c.displayName;
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
            choice.hint = '\n' + (0, utils_js_1.wordWrap)(hint, { indent: '  ', width: (0, get_tty_size_1.default)().width });
        }
        return choice;
    });
};
//# sourceMappingURL=pretty-choices.js.map