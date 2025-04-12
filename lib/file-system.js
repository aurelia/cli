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
exports.exists = exists;
exports.stat = stat;
exports.existsSync = existsSync;
exports.mkdir = mkdir;
exports.mkdirp = mkdirp;
exports.readdir = readdir;
exports.appendFile = appendFile;
exports.readdirSync = readdirSync;
exports.readFile = readFile;
exports.readFileSync = readFileSync;
exports.copySync = copySync;
exports.resolve = resolve;
exports.join = join;
exports.statSync = statSync;
exports.isFile = isFile;
exports.isDirectory = isDirectory;
exports.writeFile = writeFile;
const promises_1 = require("node:fs/promises");
const fs = __importStar(require("node:fs"));
const nodePath = __importStar(require("node:path"));
async function exists(path) {
    try {
        await (0, promises_1.access)(path, promises_1.constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
;
function stat(path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (error, stats) => {
            if (error)
                reject(error);
            else
                resolve(stats);
        });
    });
}
;
function existsSync(path) {
    return fs.existsSync(path);
}
;
function mkdir(path) {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, error => {
            if (error)
                reject(error);
            else
                resolve();
        });
    });
}
;
function mkdirp(path) {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, { recursive: true }, error => {
            if (error)
                reject(error);
            else
                resolve();
        });
    });
}
;
function readdir(path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (error, files) => {
            if (error)
                reject(error);
            else
                resolve(files);
        });
    });
}
;
function appendFile(path, text, cb) {
    fs.appendFile(path, text, cb);
}
;
function readdirSync(path) {
    return fs.readdirSync(path);
}
;
function readFile(path, encoding) {
    if (encoding !== null) {
        encoding = encoding || 'utf8';
    }
    return new Promise((resolve, reject) => {
        fs.readFile(path, encoding, (error, data) => {
            if (error)
                reject(error);
            else
                resolve(data);
        });
    });
}
;
function readFileSync(path, encoding) {
    if (encoding !== null) {
        encoding = encoding || 'utf8';
    }
    return fs.readFileSync(path, encoding);
}
;
function copySync(sourceFile, targetFile) {
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
}
;
function resolve(path) {
    return nodePath.resolve(path);
}
;
function join() {
    return nodePath.join.apply(this, Array.prototype.slice.call(arguments));
}
;
function statSync(path) {
    return fs.statSync(path);
}
;
function isFile(path) {
    try {
        return fs.statSync(path).isFile();
    }
    catch {
        // ignore
        return false;
    }
}
;
function isDirectory(path) {
    try {
        return fs.statSync(path).isDirectory();
    }
    catch {
        // ignore
        return false;
    }
}
;
function writeFile(path, content, encoding) {
    return new Promise((resolve, reject) => {
        fs.mkdir(nodePath.dirname(path), { recursive: true }, err => {
            if (err)
                reject(err);
            else {
                fs.writeFile(path, content, encoding || 'utf8', error => {
                    if (error)
                        reject(error);
                    else
                        resolve();
                });
            }
        });
    });
}
;
//# sourceMappingURL=file-system.js.map