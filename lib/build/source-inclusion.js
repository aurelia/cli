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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceInclusion = void 0;
const path = __importStar(require("node:path"));
const map_stream_1 = __importDefault(require("map-stream"));
const vfs = __importStar(require("vinyl-fs"));
class SourceInclusion {
    bundle;
    orignalPattern;
    includedBy;
    pattern;
    matcher;
    excludes;
    items;
    vfs;
    constructor(bundle, pattern, includedBy) {
        this.bundle = bundle;
        this.orignalPattern = pattern;
        // source-inclusion could be included by a dependency-inclusion
        this.includedBy = includedBy;
        if (pattern[0] === '[' && pattern[pattern.length - 1] === ']') {
            // strip "[**/*.js]" into "**/*.js"
            // this format is obsolete, but kept for backwards compatibility
            pattern = pattern.slice(1, -1);
        }
        this.pattern = pattern;
        this.matcher = this.bundle.createMatcher(pattern);
        this.excludes = this.bundle.excludes;
        this.items = [];
        this.vfs = vfs;
    }
    addItem(item) {
        item.includedBy = this;
        item.includedIn = this.bundle;
        this.items.push(item);
    }
    _isExcluded(item) {
        const found = this.excludes.findIndex(exclusion => {
            return exclusion.match(item.path);
        });
        return found > -1;
    }
    trySubsume(item) {
        if (this.matcher.match(item.path) && !this._isExcluded(item)) {
            this.addItem(item);
            return true;
        }
        return false;
    }
    addAllMatchingResources() {
        return new Promise((resolve, reject) => {
            const bundler = this.bundle.bundler;
            const pattern = path.resolve(this._getProjectRoot(), this.pattern);
            const subsume = (file, cb) => {
                bundler.addFile(file, this);
                cb(null, file);
            };
            this.vfs.src(pattern).pipe((0, map_stream_1.default)(subsume))
                .on('error', e => {
                console.log(`Error while adding all matching resources of pattern "${this.pattern}": ${e.message}`);
                reject(e);
            })
                .on('end', resolve);
        });
    }
    _getProjectRoot() {
        return this.bundle.bundler.project.paths.root;
    }
    getAllModuleIds() {
        return this.items.map(x => x.moduleId);
    }
    getAllFiles() {
        return this.items;
    }
}
exports.SourceInclusion = SourceInclusion;
;
//# sourceMappingURL=source-inclusion.js.map