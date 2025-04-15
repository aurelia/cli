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
exports.ProjectItem = void 0;
const path = __importStar(require("node:path"));
const fs = __importStar(require("./file-system"));
const Utils = __importStar(require("./build/utils"));
// Legacy code, kept only for supporting `au generate`
class ProjectItem {
    parent;
    text;
    name;
    isDirectory;
    _children;
    constructor(name, isDirectory) {
        this.name = name;
        this.isDirectory = !!isDirectory;
    }
    get children() {
        if (!this._children) {
            this._children = [];
        }
        return this._children;
    }
    add() {
        if (!this.isDirectory) {
            throw new Error('You cannot add items to a non-directory.');
        }
        for (let i = 0; i < arguments.length; ++i) {
            const child = arguments[i];
            if (this.children.indexOf(child) !== -1) {
                continue;
            }
            child.parent = this;
            this.children.push(child);
        }
        return this;
    }
    calculateRelativePath(fromLocation) {
        if (this === fromLocation) {
            return '';
        }
        const parentRelativePath = (this.parent && this.parent !== fromLocation)
            ? this.parent.calculateRelativePath(fromLocation)
            : '';
        return path.posix.join(parentRelativePath, this.name);
    }
    async create(relativeTo) {
        const fullPath = relativeTo ? this.calculateRelativePath(relativeTo) : this.name;
        // Skip empty folder
        if (this.isDirectory && this.children.length) {
            try {
                await fs.stat(fullPath);
            }
            catch {
                await fs.mkdir(fullPath);
            }
            await Utils.runSequentially(this.children, child => child.create(fullPath));
            return;
        }
        if (this.text) {
            await fs.writeFile(fullPath, this.text);
        }
    }
    setText(text) {
        this.text = text;
        return this;
    }
    getText() {
        return this.text;
    }
    static text(name, text) {
        return new ProjectItem(name, false).setText(text);
    }
    static directory(p) {
        return new ProjectItem(p, true);
    }
}
exports.ProjectItem = ProjectItem;
;
//# sourceMappingURL=project-item.js.map