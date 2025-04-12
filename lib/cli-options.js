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
exports.CLIOptions = void 0;
const fs = __importStar(require("./file-system"));
function definedEnvironments() {
    const envs = [];
    // read user defined environment files
    let files;
    try {
        files = fs.readdirSync('aurelia_project/environments');
    }
    catch {
        // ignore
    }
    if (Array.isArray(files)) {
        files.forEach(file => {
            const m = file.match(/^(.+)\.(t|j)s$/);
            if (m)
                envs.push(m[1]);
        });
    }
    return envs;
}
class CLIOptions {
    taskPath;
    args;
    commandName;
    runningGlobally;
    runningLocally;
    originalBaseDir;
    static instance; // accessed by unit test
    env; // accessed by unit test
    constructor() {
        CLIOptions.instance = this;
    }
    taskName() {
        const name = this.taskPath.split(/[/\\]/).pop();
        const parts = name.split('.');
        parts.pop();
        return parts.join('.');
    }
    getEnvironment() {
        if (this.env)
            return this.env;
        let env = this.getFlagValue('env') || process.env.NODE_ENV || 'dev';
        const envs = definedEnvironments();
        if (!envs.includes(env)) {
            // normalize NODE_ENV production/development (Node.js convention) to prod/dev
            // only if user didn't define production.js or development.js
            if (env === 'production' && envs.includes('prod')) {
                env = 'prod';
            }
            else if (env === 'development' && envs.includes('dev')) {
                env = 'dev';
            }
            else if (env !== 'dev') {
                // forgive missing aurelia_project/environments/dev.js as dev is our default env
                console.error(`The selected environment "${env}" is not defined in your aurelia_project/environments folder.`);
                process.exit(1);
                return;
            }
        }
        this.env = env;
        return env;
    }
    hasFlag(name, shortcut) {
        if (this.args) {
            let lookup = '--' + name;
            let found = this.args.indexOf(lookup) !== -1;
            if (found) {
                return true;
            }
            lookup = shortcut || ('-' + name[0]);
            found = this.args.indexOf(lookup) !== -1;
            if (found) {
                return true;
            }
            lookup = '-' + name;
            return this.args.indexOf(lookup) !== -1;
        }
        return false;
    }
    getFlagValue(name, shortcut) {
        if (this.args) {
            let lookup = '--' + name;
            let index = this.args.indexOf(lookup);
            if (index !== -1) {
                return this.args[index + 1] || null;
            }
            lookup = shortcut || ('-' + name[0]);
            index = this.args.indexOf(lookup);
            if (index !== -1) {
                return this.args[index + 1] || null;
            }
            lookup = '-' + name;
            index = this.args.indexOf(lookup);
            if (index !== -1) {
                return this.args[index + 1] || null;
            }
            return null;
        }
        return null;
    }
    static taskName() {
        return CLIOptions.instance.taskName();
    }
    static hasFlag(name, shortcut) {
        return CLIOptions.instance.hasFlag(name, shortcut);
    }
    static getFlagValue(name, shortcut) {
        return CLIOptions.instance.getFlagValue(name, shortcut);
    }
    static getEnvironment() {
        return CLIOptions.instance.getEnvironment();
    }
}
exports.CLIOptions = CLIOptions;
;
//# sourceMappingURL=cli-options.js.map