"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleUI = exports.UI = void 0;
const os = __importStar(require("os"));
const file_system_1 = require("./file-system");
const utils_js_1 = require("enquirer/lib/utils.js");
const get_tty_size_1 = require("./get-tty-size");
const pretty_choices_1 = require("./pretty-choices");
const stream_1 = require("stream");
const _ = __importStar(require("lodash"));
const enquirer_1 = require("enquirer");
/** Base class, used for DI registration of `ConsoleUI` */
class UI {
}
exports.UI = UI;
class ConsoleUI {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static UI(UI, ui) {
        throw new Error('Method not implemented.');
    }
    cliOptions;
    static ConsoleUI;
    constructor(cliOptions) {
        this.cliOptions = cliOptions;
    }
    log(text, indent) {
        if (indent !== undefined) {
            text = (0, utils_js_1.wordWrap)(text, { indent, width: this.getWidth() });
        }
        return new Promise(resolve => {
            console.log(text);
            resolve();
        });
    }
    ensureAnswer(answer, question, suggestion) {
        return this._ensureAnswer(answer, question, suggestion);
    }
    // _debug is used to pass in answers for prompts.
    async _ensureAnswer(answer, question, suggestion, _debug = []) {
        if (answer)
            return answer;
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
            PromptType = enquirer_1.Input;
        }
        else {
            options = options.filter(x => includeOption(this.cliOptions, x));
            if (options.length === 1) {
                return options[0].value || options[0].displayName;
            }
            opts = {
                type: 'select',
                name: 'answer',
                message: question,
                initial: defaultValue || options[0].value || options[0].displayName,
                choices: (0, pretty_choices_1.prettyChoices)(options),
                // https://github.com/enquirer/enquirer/issues/121#issuecomment-468413408
                result(name) {
                    return this.map(name)[name];
                }
            };
            PromptType = enquirer_1.Select;
        }
        if (_debug && _debug.length) {
            // Silent output in debug mode
            opts.stdout = new stream_1.Writable({ write(c, e, cb) { cb(); } });
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
            choices: (0, pretty_choices_1.prettyChoices)(options),
            validate: results => results.length === 0 ? 'Need at least one selection' : true,
            // https://github.com/enquirer/enquirer/issues/121#issuecomment-468413408
            result(names) {
                return Object.values(this.map(names));
            }
        };
        if (_debug && _debug.length) {
            // Silent output in debug mode
            opts.stdout = new stream_1.Writable({ write(c, e, cb) { cb(); } });
        }
        return await _run(new enquirer_1.Select(opts), _debug);
    }
    getWidth() {
        return (0, get_tty_size_1.getTtySize)().width;
    }
    getHeight() {
        return (0, get_tty_size_1.getTtySize)().height;
    }
    async displayLogo() {
        if (this.getWidth() < 50) {
            return this.log('Aurelia CLI' + os.EOL);
        }
        const logoLocation = require.resolve('./resources/logo.txt');
        const logo = await (0, file_system_1.readFile)(logoLocation);
        void this.log(logo.toString());
    }
}
exports.ConsoleUI = ConsoleUI;
;
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
        prompt.once('run', async () => {
            for (let d = 0, dd = _debug.length; d < dd; d++) {
                let debugChoice = _debug[d];
                if (typeof debugChoice === 'number') {
                    // choice index is 1-based.
                    while (debugChoice-- > 0) {
                        if (debugChoice) {
                            await prompt.keypress(null, { name: 'down' });
                        }
                        else {
                            await prompt.submit();
                        }
                    }
                }
                else if (typeof debugChoice === 'string') {
                    for (let i = 0, ii = debugChoice.length; i < ii; i++) {
                        await prompt.keypress(debugChoice[i]);
                    }
                    await prompt.submit();
                }
                else if (typeof debugChoice === 'function') {
                    await debugChoice(prompt);
                }
            }
        });
    }
    return await prompt.run();
}
//# sourceMappingURL=ui.js.map