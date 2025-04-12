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
exports.DependencyDescription = void 0;
const path = __importStar(require("node:path"));
const fs = __importStar(require("../file-system"));
const Utils = __importStar(require("./utils"));
class DependencyDescription {
    name;
    source;
    location;
    loaderConfig;
    metadata;
    metadataLocation;
    constructor(name, source) {
        this.name = name;
        this.source = source;
    }
    get mainId() {
        return this.name + '/' + this.loaderConfig.main;
    }
    get banner() {
        const { metadata, name } = this;
        const version = (metadata && metadata.version) || '';
        return `package: ${version}${' '.repeat(version.length < 10 ? (10 - version.length) : 0)} ${name}`;
    }
    calculateMainPath(root) {
        const config = this.loaderConfig;
        let part = path.join(config.path, config.main);
        const ext = path.extname(part).toLowerCase();
        if (!ext || Utils.knownExtensions.indexOf(ext) === -1) {
            part = part + '.js';
        }
        return path.join(process.cwd(), root, part);
    }
    readMainFileSync(root) {
        const p = this.calculateMainPath(root);
        try {
            return fs.readFileSync(p).toString();
        }
        catch {
            console.log('error', p);
            return '';
        }
    }
    // https://github.com/defunctzombie/package-browser-field-spec
    browserReplacement() {
        const browser = this.metadata && this.metadata.browser;
        // string browser field is handled in package-analyzer
        if (!browser || typeof browser === 'string')
            return;
        const replacement = {};
        for (let i = 0, keys = Object.keys(browser); i < keys.length; i++) {
            const key = keys[i];
            // leave {".": "dist/index.js"} for main replacement
            if (key === '.')
                continue;
            const target = browser[key];
            let sourceModule = filePathToModuleId(key);
            if (key.startsWith('.')) {
                sourceModule = './' + sourceModule;
            }
            if (typeof target === 'string') {
                let targetModule = filePathToModuleId(target);
                if (!targetModule.startsWith('.')) {
                    targetModule = './' + targetModule;
                }
                replacement[sourceModule] = targetModule;
            }
            else {
                replacement[sourceModule] = false;
            }
        }
        return replacement;
    }
}
exports.DependencyDescription = DependencyDescription;
;
function filePathToModuleId(filePath) {
    let moduleId = path.normalize(filePath).replace(/\\/g, '/');
    if (moduleId.toLowerCase().endsWith('.js')) {
        moduleId = moduleId.slice(0, -3);
    }
    return moduleId;
}
//# sourceMappingURL=dependency-description.js.map