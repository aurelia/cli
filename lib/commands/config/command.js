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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const os = __importStar(require("node:os"));
const configuration_1 = __importDefault(require("./configuration"));
const util_1 = __importDefault(require("./util"));
const aurelia_dependency_injection_1 = require("aurelia-dependency-injection");
const ui_1 = require("../../ui");
const cli_options_1 = require("../../cli-options");
module.exports = class {
    static inject() { return [aurelia_dependency_injection_1.Container, ui_1.UI, cli_options_1.CLIOptions]; }
    container;
    ui;
    options;
    config;
    util;
    constructor(container, ui, options) {
        this.container = container;
        this.ui = ui;
        this.options = options;
    }
    execute(args) {
        this.config = new configuration_1.default(this.options);
        this.util = new util_1.default(this.options, args);
        const key = this.util.getArg(0) || '';
        const value = this.util.getValue(this.util.getArg(1));
        const save = !cli_options_1.CLIOptions.hasFlag('no-save');
        const backup = !cli_options_1.CLIOptions.hasFlag('no-backup');
        const action = this.util.getAction(value);
        this.displayInfo(`Performing configuration action '${action}' on '${key}'${value ? ` with '${value}'` : ''}`);
        this.displayInfo(this.config.execute(action, key, value));
        if (action !== 'get') {
            if (save) {
                this.config.save(backup).then((name) => {
                    this.displayInfo('Configuration saved. ' + (backup ? `Backup file '${name}' created.` : 'No backup file was created.'));
                });
            }
            else {
                this.displayInfo(`Action was '${action}', but no save was performed!`);
            }
        }
    }
    displayInfo(message) {
        return this.ui.log(message + os.EOL);
    }
};
//# sourceMappingURL=command.js.map