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
const cli_options_1 = require("../../cli-options");
const ui = __importStar(require("../../ui"));
const aurelia_dependency_injection_1 = require("aurelia-dependency-injection");
const project_1 = require("../../project");
const string = __importStar(require("../../string"));
module.exports = class {
    options;
    ui;
    project;
    static inject() { return [cli_options_1.CLIOptions, ui.UI, aurelia_dependency_injection_1.Optional.of(project_1.Project)]; }
    constructor(options, ui, project) {
        this.options = options;
        this.ui = ui;
        this.project = project;
    }
    async execute() {
        await this.ui.displayLogo();
        let text;
        if (this.options.runningGlobally) {
            text = await this.getGlobalCommandText();
        }
        else {
            text = await this.getLocalCommandText();
        }
        this.ui.log(text);
    }
    async getGlobalCommandText() {
        return string.buildFromMetadata([
            require('../new/command.json'),
            require('./command.json')
        ], this.ui.getWidth());
    }
    async getLocalCommandText() {
        const commands = [
            require('../generate/command.json'),
            require('../config/command.json'),
            require('./command.json')
        ];
        const metadata = await this.project.getTaskMetadata();
        return string.buildFromMetadata(metadata.concat(commands), this.ui.getWidth());
    }
};
//# sourceMappingURL=command.js.map