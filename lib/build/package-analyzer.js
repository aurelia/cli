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
exports.PackageAnalyzer = void 0;
const fs = __importStar(require("../file-system"));
const path = __importStar(require("node:path"));
const dependency_description_1 = require("./dependency-description");
const Utils = __importStar(require("./utils"));
const aurelia_logging_1 = require("aurelia-logging");
const logger = (0, aurelia_logging_1.getLogger)('PackageAnalyzer');
class PackageAnalyzer {
    project;
    constructor(project) {
        this.project = project;
    }
    async analyze(packageName) {
        const description = new dependency_description_1.DependencyDescription(packageName, 'npm');
        await loadPackageMetadata(this.project, description);
        if (!description.metadataLocation) {
            throw new Error(`Unable to find package metadata (package.json) of ${description.name}`);
        }
        determineLoaderConfig(this.project, description);
        return description;
    }
    async reverseEngineer(loaderConfig) {
        loaderConfig = JSON.parse(JSON.stringify(loaderConfig));
        const description = new dependency_description_1.DependencyDescription(loaderConfig.name);
        description.loaderConfig = loaderConfig;
        if (!loaderConfig.packageRoot && (!loaderConfig.path || loaderConfig.path.indexOf('node_modules') !== -1)) {
            description.source = 'npm';
        }
        else {
            description.source = 'custom';
            if (!loaderConfig.packageRoot) {
                fillUpPackageRoot(this.project, description);
            }
        }
        await loadPackageMetadata(this.project, description);
        if (!loaderConfig.path) {
            // fillup main and path
            determineLoaderConfig(this.project, description);
        }
        else {
            if (!loaderConfig.main) {
                if (description.source === 'custom' && loaderConfig.path === loaderConfig.packageRoot) {
                    // fillup main and path
                    determineLoaderConfig(this.project, description);
                }
                else {
                    const fullPath = path.resolve(this.project.paths.root, loaderConfig.path);
                    if (fullPath === description.location) {
                        // fillup main and path
                        determineLoaderConfig(this.project, description);
                        return description;
                    }
                    // break single path into main and dir
                    const pathParts = path.parse(fullPath);
                    // when path is node_modules/package/foo/bar
                    // set path to node_modules/package
                    // set main to foo/bar
                    loaderConfig.path = path.relative(this.project.paths.root, description.location).replace(/\\/g, '/');
                    if (pathParts.dir.length > description.location.length + 1) {
                        const main = path.join(pathParts.dir.slice(description.location.length + 1), Utils.removeJsExtension(pathParts.base));
                        loaderConfig.main = main.replace(/\\/g, '/');
                    }
                    else if (pathParts.dir.length === description.location.length) {
                        loaderConfig.main = Utils.removeJsExtension(pathParts.base).replace(/\\/g, '/');
                    }
                    else {
                        throw new Error(`Path: "${loaderConfig.path}" is not in: ${description.location}`);
                    }
                }
            }
            else {
                loaderConfig.main = Utils.removeJsExtension(loaderConfig.main).replace(/\\/g, '/');
            }
        }
        return description;
    }
}
exports.PackageAnalyzer = PackageAnalyzer;
;
function fillUpPackageRoot(project, description) {
    let _path = description.loaderConfig.path;
    const ext = path.extname(_path).toLowerCase();
    if (!ext || Utils.knownExtensions.indexOf(ext) === -1) {
        // main file could be non-js file like css/font-awesome.css
        _path += '.js';
    }
    if (fs.isFile(path.resolve(project.paths.root, _path))) {
        description.loaderConfig.packageRoot = path.dirname(description.loaderConfig.path).replace(/\\/g, '/');
    }
    if (!description.loaderConfig.packageRoot) {
        description.loaderConfig.packageRoot = description.loaderConfig.path;
    }
}
async function loadPackageMetadata(project, description) {
    await setLocation(project, description);
    try {
        if (description.metadataLocation) {
            const data = await fs.readFile(description.metadataLocation);
            description.metadata = JSON.parse(data.toString());
        }
    }
    catch (e) {
        logger.error(`Unable to load package metadata (package.json) of ${description.name}:`);
        logger.info(e);
    }
}
// loaderConfig.path is simplified when use didn't provide explicit config.
// In auto traced nodejs package, loaderConfig.path always matches description.location.
// We then use auto-generated moduleId aliases in dependency-inclusion to make AMD
// module system happy.
function determineLoaderConfig(project, description) {
    const location = path.resolve(description.location);
    const mainPath = Utils.nodejsLoad(location);
    if (!description.loaderConfig) {
        description.loaderConfig = { name: description.name };
    }
    description.loaderConfig.path = path.relative(project.paths.root, description.location).replace(/\\/g, '/');
    if (mainPath) {
        description.loaderConfig.main = Utils.removeJsExtension(mainPath.slice(location.length + 1).replace(/\\/g, '/'));
    }
    else {
        logger.warn(`The "${description.name}" package has no valid main file, fall back to index.js.`);
        description.loaderConfig.main = 'index';
    }
}
async function setLocation(project, description) {
    switch (description.source) {
        case 'npm':
            {
                const packageFolder = await getPackageFolder(project, description);
                description.location = packageFolder;
                return await tryFindMetadata(project, description);
            }
        case 'custom':
            description.location = path.resolve(project.paths.root, description.loaderConfig.packageRoot);
            return tryFindMetadata(project, description);
        default:
            return Promise.reject(`The package source "${description.source}" is not supported.`);
    }
}
async function tryFindMetadata(project, description) {
    try {
        await fs.stat(path.join(description.location, 'package.json'));
        return description.metadataLocation = path.join(description.location, 'package.json');
    }
    catch { /* empty */ }
}
async function getPackageFolder(project, description) {
    if (!description.loaderConfig || !description.loaderConfig.path) {
        return await Utils.resolvePackagePath(description.name);
    }
    return lookupPackageFolderRelativeStrategy(project.paths.root, description.loaderConfig.path);
}
// Looks for the node_modules folder from the root path of aurelia
// with the defined loaderConfig.
function lookupPackageFolderRelativeStrategy(root, relativePath) {
    const pathParts = relativePath.replace(/\\/g, '/').split('/');
    let packageFolder = '';
    let stopOnNext = false;
    for (let i = 0; i < pathParts.length; ++i) {
        const part = pathParts[i];
        packageFolder = path.join(packageFolder, part);
        if (stopOnNext && !part.startsWith('@')) {
            break;
        }
        else if (part === 'node_modules') {
            stopOnNext = true;
        }
    }
    return Promise.resolve(path.resolve(root, packageFolder));
}
//# sourceMappingURL=package-analyzer.js.map