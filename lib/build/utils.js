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
exports.cacheDir = exports.knownExtensions = void 0;
exports.couldMissGulpPreprocess = couldMissGulpPreprocess;
exports.resolvePackagePath = resolvePackagePath;
exports.moduleIdWithPlugin = moduleIdWithPlugin;
exports.getCache = getCache;
exports.setCache = setCache;
exports.runSequentially = runSequentially;
exports.generateHashedPath = generateHashedPath;
exports.revertHashedPath = revertHashedPath;
exports.generateHash = generateHash;
exports.escapeForRegex = escapeForRegex;
exports.createBundleFileRegex = createBundleFileRegex;
exports.nodejsLoad = nodejsLoad;
exports.removeJsExtension = removeJsExtension;
const path = __importStar(require("node:path"));
const os = __importStar(require("node:os"));
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("../file-system"));
const tmpDir = os.tmpdir();
exports.knownExtensions = ['.js', '.cjs', '.mjs', '.json', '.css', '.svg', '.html'];
function couldMissGulpPreprocess(id) {
    const ext = path.extname(id).toLowerCase();
    return ext && ext !== '.js' && ext !== '.html' && ext !== '.css';
}
;
async function getPackagePaths() {
    // require.resolve(packageName) cannot resolve package has no main.
    // for instance: font-awesome v4.7.0
    // manually try resolve paths
    return [
        // normal search from cli
        ...require.resolve.paths('not-core/'),
        // additional search from app's folder, this is necessary to support
        // lerna hoisting where cli is out of app's local node_modules folder.
        ...(await Promise.resolve().then(() => __importStar(require('resolve/lib/node-modules-paths')))).default(process.cwd(), {})
    ];
}
// resolve npm package path
async function resolvePackagePath(packageName) {
    const packagePaths = await getPackagePaths();
    for (let i = 0, len = packagePaths.length; i < len; i++) {
        const dirname = path.join(packagePaths[i], packageName);
        if (fs.isDirectory(dirname))
            return dirname;
    }
    throw new Error(`cannot resolve npm package folder for "${packageName}"`);
}
;
function moduleIdWithPlugin(moduleId, pluginName, type) {
    switch (type) {
        case 'require':
            return pluginName + '!' + moduleId;
        case 'system':
            return moduleId + '!' + pluginName;
        default:
            throw new Error(`Loader configuration style ${type} is not supported.`);
    }
}
;
const CACHE_DIR = path.resolve(tmpDir, 'aurelia-cli-cache');
exports.cacheDir = CACHE_DIR;
function cachedFilePath(hash) {
    const folder = hash.slice(0, 2);
    const fileName = hash.slice(2);
    return path.resolve(CACHE_DIR, folder, fileName);
}
function getCache(hash) {
    const filePath = cachedFilePath(hash);
    try {
        return JSON.parse(fs.readFileSync(filePath));
    }
    catch {
        // ignore
    }
}
;
function setCache(hash, object) {
    const filePath = cachedFilePath(hash);
    // async write
    fs.writeFileSync(filePath, JSON.stringify(object));
}
;
async function runSequentially(tasks, cb) {
    let index = -1;
    const result = [];
    async function exec() {
        index++;
        if (index < tasks.length) {
            const r = await cb(tasks[index], index);
            result.push(r);
            await exec();
        }
    }
    await exec();
    return result;
}
;
function generateHashedPath(pth, hash) {
    if (arguments.length !== 2) {
        throw new Error('`path` and `hash` required');
    }
    return modifyFilename(pth, function (filename, ext) {
        return filename + '-' + hash + ext;
    });
}
;
function revertHashedPath(pth, hash) {
    if (arguments.length !== 2) {
        throw new Error('`path` and `hash` required');
    }
    return modifyFilename(pth, function (filename, ext) {
        return filename.replace(new RegExp('-' + hash + '$'), '') + ext;
    });
}
;
function generateHash(bufOrStr) {
    return crypto.createHash('md5').update(bufOrStr).digest('hex');
}
;
function escapeForRegex(str) {
    const matchers = /[|\\{}()[\]^$+*?.]/g;
    return str.replace(matchers, '\\$&');
}
;
function createBundleFileRegex(bundleName) {
    return new RegExp(escapeForRegex(bundleName) + '[^"\']*?\\.js', 'g');
}
;
function modifyFilename(pth, modifier) {
    if (arguments.length !== 2) {
        throw new Error('`path` and `modifier` required');
    }
    if (Array.isArray(pth)) {
        return pth.map(function (el) {
            return modifyFilename(el, modifier);
        });
    }
    const ext = path.extname(pth);
    return path.posix.join(path.dirname(pth), modifier(path.basename(pth, ext), ext));
}
// https://nodejs.org/dist/latest-v10.x/docs/api/modules.html
// after "high-level algorithm in pseudocode of what require.resolve() does"
function nodejsLoadAsFile(resourcePath) {
    if (fs.isFile(resourcePath)) {
        return resourcePath;
    }
    if (fs.isFile(resourcePath + '.js')) {
        return resourcePath + '.js';
    }
    if (fs.isFile(resourcePath + '.json')) {
        return resourcePath + '.json';
    }
    // skip .node file that nobody uses
}
function nodejsLoadIndex(resourcePath) {
    if (!fs.isDirectory(resourcePath))
        return;
    const indexJs = path.join(resourcePath, 'index.js');
    if (fs.isFile(indexJs)) {
        return indexJs;
    }
    const indexJson = path.join(resourcePath, 'index.json');
    if (fs.isFile(indexJson)) {
        return indexJson;
    }
    // skip index.node file that nobody uses
}
function nodejsLoadAsDirectory(resourcePath) {
    if (!fs.isDirectory(resourcePath))
        return;
    const packageJson = path.join(resourcePath, 'package.json');
    if (fs.isFile(packageJson)) {
        let metadata;
        try {
            metadata = JSON.parse(fs.readFileSync(packageJson));
        }
        catch (err) {
            console.error(err);
            return;
        }
        let metaMain;
        // try 1.browser > 2.module > 3.main
        // the order is to target browser.
        // when aurelia-cli introduces multi-targets build,
        // it probably should use different order for electron app
        // for electron 1.module > 2.browser > 3.main
        if (typeof metadata.browser === 'string') {
            // use package.json browser field if possible.
            metaMain = metadata.browser;
        }
        else if (typeof metadata.browser === 'object' && typeof metadata.browser['.'] === 'string') {
            // use package.json browser mapping {".": "dist/index.js"} if possible.
            metaMain = metadata.browser['.'];
        }
        else if (typeof metadata.module === 'string' &&
            !(metadata.name && metadata.name.startsWith('aurelia-'))) {
            // prefer es module format over cjs, just like webpack.
            // this improves compatibility with TypeScript.
            // ignores aurelia-* core npm packages as their module
            // field is pointing to es2015 folder.
            metaMain = metadata.module;
        }
        else if (typeof metadata.main === 'string') {
            metaMain = metadata.main;
        }
        const mainFile = metaMain || 'index';
        const mainResourcePath = path.resolve(resourcePath, mainFile);
        return nodejsLoadAsFile(mainResourcePath) || nodejsLoadIndex(mainResourcePath);
    }
    return nodejsLoadIndex(resourcePath);
}
function nodejsLoad(resourcePath) {
    return nodejsLoadAsFile(resourcePath) || nodejsLoadAsDirectory(resourcePath);
}
;
function removeJsExtension(filePath) {
    if (path.extname(filePath).toLowerCase() === '.js') {
        return filePath.slice(0, -3);
    }
    return filePath;
}
;
//# sourceMappingURL=utils.js.map