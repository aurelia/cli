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
exports.DependencyInclusion = void 0;
const path = __importStar(require("node:path"));
const source_inclusion_1 = require("./source-inclusion");
const minimatch_1 = require("minimatch");
const Utils = __importStar(require("./utils"));
const aurelia_logging_1 = require("aurelia-logging");
const logger = (0, aurelia_logging_1.getLogger)('DependencyInclusion');
const knownNonJsExtensions = ['.json', '.css', '.svg', '.html'];
class DependencyInclusion {
    bundle;
    description;
    mainTraced;
    constructor(bundle, description) {
        this.bundle = bundle;
        this.description = description;
        this.mainTraced = false;
    }
    traceMain() {
        if (this.mainTraced)
            return Promise.resolve();
        this.mainTraced = true;
        const mainId = this.description.mainId;
        const ext = path.extname(mainId).toLowerCase();
        const mainIsJs = !ext || knownNonJsExtensions.indexOf(ext) === -1;
        if (mainIsJs || ext === path.extname(this.description.name).toLowerCase()) {
            // only create alias when main is js file
            // or package name shares same extension (like normalize.css with main file normalize.css)
            this.bundle.addAlias(this.description.name, mainId);
        }
        let main = this.description.loaderConfig.main;
        if (mainIsJs && Utils.knownExtensions.indexOf(ext) === -1) {
            main += '.js';
        }
        return this._tracePattern(main);
    }
    traceResources() {
        let work = Promise.resolve();
        // when user import from 'lodash/map',
        // only bundle node_modules/lodash/map.js,
        // without bundle node_modules/lodash/lodash.js,
        // which in addition trace and bundle everything.
        if (!this.description.loaderConfig.lazyMain) {
            work = work.then(() => this.traceMain());
        }
        const loaderConfig = this.description.loaderConfig;
        const resources = loaderConfig.resources;
        if (resources) {
            resources.forEach(x => {
                work = work.then(() => this._tracePattern(x));
            });
        }
        return work;
    }
    traceResource(resource) {
        const resolved = resolvedResource(resource, this.description, this._getProjectRoot());
        if (!resolved) {
            logger.error(`Error: could not find "${resource}" in package ${this.description.name}`);
            return Promise.resolve();
        }
        if (Utils.removeJsExtension(resolved) !== Utils.removeJsExtension(resource)) {
            // alias bootstrap/css/bootstrap.css to bootstrap/lib/css/bootstrap.css
            this.bundle.addAlias(this.description.name + '/' + Utils.removeJsExtension(resource), this.description.name + '/' + Utils.removeJsExtension(resolved));
        }
        const covered = this.bundle.includes.find(inclusion => inclusion instanceof source_inclusion_1.SourceInclusion &&
            inclusion.includedBy === this &&
            (0, minimatch_1.minimatch)(resolved, inclusion.pattern));
        if (covered) {
            return Promise.resolve();
        }
        return this._tracePattern(resolved);
    }
    _tracePattern(resource) {
        const loaderConfig = this.description.loaderConfig;
        const bundle = this.bundle;
        const pattern = path.join(loaderConfig.path, resource);
        const inclusion = new source_inclusion_1.SourceInclusion(bundle, pattern, this);
        const promise = inclusion.addAllMatchingResources();
        bundle.includes.push(inclusion);
        bundle.requiresBuild = true;
        return promise;
    }
    // If all resources has same prefix like dist/type,
    // create conventional aliases like:
    // define('package/foo/bar', ['package/dist/type/foo/bar'], function(m) {return m;});
    conventionalAliases() {
        const ids = [];
        this.bundle.includes.forEach(inclusion => {
            if (inclusion instanceof source_inclusion_1.SourceInclusion && inclusion.includedBy === this) {
                ids.push(...inclusion.getAllModuleIds());
            }
        });
        if (ids.length < 2)
            return {};
        const nameLength = this.description.name.length;
        const commonLen = commonLength(ids);
        if (!commonLen || commonLen <= nameLength + 1)
            return {};
        const aliases = {};
        ids.forEach(id => {
            // for aurelia-templating-resources/dist/commonjs/if
            // compact name is aurelia-templating-resources/if
            const compactResource = id.slice(commonLen);
            if (compactResource) {
                const compactId = this.description.name + '/' + compactResource;
                aliases[compactId] = id;
            }
        });
        return aliases;
    }
    trySubsume() {
        return false;
    }
    getAllModuleIds() {
        // placeholder
        // all module ids are provided by source inclusion, including main module
        return [];
    }
    getAllFiles() {
        return []; // return this.items;
    }
    _getProjectRoot() {
        return this.bundle.bundler.project.paths.root;
    }
}
exports.DependencyInclusion = DependencyInclusion;
;
function resolvedResource(resource, description, projectRoot) {
    const base = path.resolve(projectRoot, description.loaderConfig.path);
    const mainShift = description.loaderConfig.main.split('/');
    // when mainShift is [dist,commonjs]
    // try  dist/commonjs/resource first
    // then dist/resource
    // then resource
    let resolved;
    do {
        mainShift.pop();
        let res;
        if (mainShift.length) {
            res = mainShift.join('/') + '/' + resource;
        }
        else {
            res = resource;
        }
        resolved = validResource(res, base);
        if (resolved)
            break;
    } while (mainShift.length);
    return resolved;
}
function validResource(resource, base) {
    const resourcePath = path.resolve(base, resource);
    const loaded = Utils.nodejsLoad(resourcePath);
    if (loaded)
        return path.relative(base, loaded).replace(/\\/g, '/');
}
function commonLength(ids) {
    const parts = ids[0].split('/');
    const rest = ids.slice(1);
    parts.pop(); // ignore last part
    let common = '';
    for (let i = 0, len = parts.length; i < len; i++) {
        const all = common + parts[i] + '/';
        if (rest.every(id => id.startsWith(all))) {
            common = all;
        }
        else {
            break;
        }
    }
    return common.length;
}
//# sourceMappingURL=dependency-inclusion.js.map