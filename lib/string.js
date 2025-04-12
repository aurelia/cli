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
exports.buildFromMetadata = buildFromMetadata;
const os = __importStar(require("node:os"));
const c = __importStar(require("ansi-colors"));
const utils_js_1 = require("enquirer/lib/utils.js");
function buildFromMetadata(metadata, width) {
    let text = '';
    metadata.forEach(json => text += transformCommandToStyledText(json, width));
    return text;
}
;
function transformCommandToStyledText(json, width) {
    const indent = ' '.repeat(4);
    let text = c.magenta.bold(json.name);
    width = width || 1000;
    if (json.parameters) {
        json.parameters.forEach(parameter => {
            if (parameter.optional) {
                text += ' ' + c.dim(parameter.name);
            }
            else {
                text += ' ' + parameter.name;
            }
        });
    }
    if (json.flags) {
        json.flags.forEach(flag => {
            text += ' ' + c.yellow('--' + flag.name);
            if (flag.type !== 'boolean') {
                text += ' value';
            }
        });
    }
    text += os.EOL + os.EOL;
    text += (0, utils_js_1.wordWrap)(json.description, { indent, width });
    if (json.parameters) {
        json.parameters.forEach(parameter => {
            text += os.EOL + os.EOL;
            let parameterInfo = parameter.name;
            if (parameter.optional) {
                parameterInfo += ' (optional)';
            }
            parameterInfo = c.blue(parameterInfo) + ' - ' + parameter.description;
            text += (0, utils_js_1.wordWrap)(parameterInfo, { indent, width });
        });
    }
    if (json.flags) {
        json.flags.forEach(flag => {
            text += os.EOL + os.EOL;
            let flagInfo = c.yellow('--' + flag.name);
            flagInfo += ' - ' + flag.description;
            text += (0, utils_js_1.wordWrap)(flagInfo, { indent, width });
        });
    }
    text += os.EOL + os.EOL;
    return text;
}
//# sourceMappingURL=string.js.map