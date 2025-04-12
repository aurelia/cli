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
const aurelia_dependency_injection_1 = require("aurelia-dependency-injection");
const ui_1 = require("../../ui");
const cli_options_1 = require("../../cli-options");
const project_1 = require("../../project");
const string = __importStar(require("../../string"));
const os = __importStar(require("node:os"));
module.exports = class {
    static inject() { return [aurelia_dependency_injection_1.Container, ui_1.UI, cli_options_1.CLIOptions, project_1.Project]; }
    container;
    ui;
    options;
    project;
    constructor(container, ui, options, project) {
        this.container = container;
        this.ui = ui;
        this.options = options;
        this.project = project;
    }
    async execute(args) {
        if (args.length < 1) {
            return this.displayGeneratorInfo('No Generator Specified. Available Generators:');
        }
        this.project.installTranspiler();
        const generatorPath = await this.project.resolveGenerator(args[0]);
        Object.assign(this.options, {
            generatorPath: generatorPath,
            args: args.slice(1)
        });
        if (generatorPath) {
            const module = await Promise.resolve(`${generatorPath}`).then(s => __importStar(require(s)));
            let generator = this.project.getExport(module);
            if (generator.inject) {
                generator = this.container.get(generator);
                generator = generator.execute.bind(generator);
            }
            return generator();
        }
        return this.displayGeneratorInfo(`Invalid Generator: ${args[0]}. Available Generators:`);
    }
    async displayGeneratorInfo(message) {
        await this.ui.displayLogo();
        await this.ui.log(message + os.EOL);
        const metadata = await this.project.getGeneratorMetadata();
        const str = string.buildFromMetadata(metadata, this.ui.getWidth());
        return await this.ui.log(str);
    }
};
//# sourceMappingURL=command.js.map