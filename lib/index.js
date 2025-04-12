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
exports.Yarn = exports.NPM = exports.reportWebpackReadiness = exports.Configuration = exports.build = exports.ProjectItem = exports.Project = exports.UI = exports.CLIOptions = exports.CLI = void 0;
require("aurelia-polyfills");
var cli_1 = require("./cli");
Object.defineProperty(exports, "CLI", { enumerable: true, get: function () { return cli_1.CLI; } });
var cli_options_1 = require("./cli-options");
Object.defineProperty(exports, "CLIOptions", { enumerable: true, get: function () { return cli_options_1.CLIOptions; } });
var ui_1 = require("./ui");
Object.defineProperty(exports, "UI", { enumerable: true, get: function () { return ui_1.UI; } });
var project_1 = require("./project");
Object.defineProperty(exports, "Project", { enumerable: true, get: function () { return project_1.Project; } });
var project_item_1 = require("./project-item");
Object.defineProperty(exports, "ProjectItem", { enumerable: true, get: function () { return project_item_1.ProjectItem; } });
exports.build = __importStar(require("./build/index"));
var configuration_1 = require("./configuration");
Object.defineProperty(exports, "Configuration", { enumerable: true, get: function () { return configuration_1.Configuration; } });
var webpack_reporter_1 = require("./build/webpack-reporter");
Object.defineProperty(exports, "reportWebpackReadiness", { enumerable: true, get: function () { return webpack_reporter_1.reportReadiness; } });
var npm_1 = require("./package-managers/npm");
Object.defineProperty(exports, "NPM", { enumerable: true, get: function () { return npm_1.NPM; } });
var yarn_1 = require("./package-managers/yarn");
Object.defineProperty(exports, "Yarn", { enumerable: true, get: function () { return yarn_1.Yarn; } });
//# sourceMappingURL=index.js.map