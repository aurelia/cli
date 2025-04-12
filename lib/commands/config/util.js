"use strict";
class ConfigurationUtilities {
    options;
    args;
    constructor(options, args) {
        this.options = options;
        this.args = args;
    }
    getArg(arg) {
        const args = this.args;
        if (args) {
            for (let i = 0; i < args.length; i++) {
                if (args[i].startsWith('--')) {
                    arg++;
                }
                if (i === arg) {
                    return args[i];
                }
            }
        }
    }
    getValue(value) {
        if (value) {
            if (!value.startsWith('"') &&
                !value.startsWith('[') &&
                !value.startsWith('{')) {
                value = `"${value}"`;
            }
            value = JSON.parse(value);
        }
        return value;
    }
    getAction(value) {
        const actions = ['add', 'remove', 'set', 'clear', 'get'];
        for (const action of actions) {
            if (this.options.hasFlag(action)) {
                return action;
            }
        }
        if (!value) {
            return 'get';
        }
        if (Array.isArray(value) || typeof value === 'object') {
            return 'add';
        }
        return 'set';
    }
}
module.exports = ConfigurationUtilities;
//# sourceMappingURL=util.js.map