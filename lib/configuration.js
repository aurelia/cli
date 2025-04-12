"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
const cli_options_1 = require("./cli-options");
class Configuration {
    options;
    environment;
    constructor(options, defaultOptions, environment) {
        this.options = Object.assign({}, defaultOptions, options);
        this.environment = environment || cli_options_1.CLIOptions.getEnvironment();
    }
    getAllOptions() {
        return this.options;
    }
    getValue(propPath) {
        const split = propPath.split('.');
        let cur = this.options;
        for (let i = 0; i < split.length; i++) {
            if (!cur) {
                return undefined;
            }
            cur = cur[split[i]];
        }
        if (typeof cur === 'object') {
            const keys = Object.keys(cur);
            let result = undefined;
            if (keys.indexOf('default') > -1 && typeof (cur.default) === 'object') {
                result = cur.default;
            }
            for (let i = 0; i < keys.length; i++) {
                if (this.matchesEnvironment(this.environment, keys[i])) {
                    if (typeof (cur[keys[i]]) === 'object') {
                        result = Object.assign(result || {}, cur[keys[i]]);
                    }
                    else {
                        return cur[keys[i]];
                    }
                }
            }
            return result;
        }
        return cur;
    }
    isApplicable(propPath) {
        const value = this.getValue(propPath);
        if (!value) {
            return false;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            return this.matchesEnvironment(this.environment, value);
        }
        if (typeof value === 'object') {
            return true;
        }
        return false;
    }
    matchesEnvironment(environment, value) {
        const parts = value.split('&').map(x => x.trim().toLowerCase());
        return parts.indexOf(environment) !== -1;
    }
}
exports.Configuration = Configuration;
;
//# sourceMappingURL=configuration.js.map