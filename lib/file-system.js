"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statSync = exports.readdirSync = exports.appendFile = exports.readdir = exports.existsSync = exports.mkdir = exports.stat = void 0;
exports.exists = exists;
exports.mkdirp = mkdirp;
exports.readFile = readFile;
exports.readFileSync = readFileSync;
exports.copySync = copySync;
exports.resolve = resolve;
exports.join = join;
exports.isFile = isFile;
exports.isDirectory = isDirectory;
exports.writeFile = writeFile;
exports.writeFileSync = writeFileSync;
const promises_1 = require("node:fs/promises");
Object.defineProperty(exports, "stat", { enumerable: true, get: function () { return promises_1.stat; } });
Object.defineProperty(exports, "mkdir", { enumerable: true, get: function () { return promises_1.mkdir; } });
Object.defineProperty(exports, "readdir", { enumerable: true, get: function () { return promises_1.readdir; } });
Object.defineProperty(exports, "appendFile", { enumerable: true, get: function () { return promises_1.appendFile; } });
const node_fs_1 = require("node:fs");
Object.defineProperty(exports, "existsSync", { enumerable: true, get: function () { return node_fs_1.existsSync; } });
Object.defineProperty(exports, "readdirSync", { enumerable: true, get: function () { return node_fs_1.readdirSync; } });
Object.defineProperty(exports, "statSync", { enumerable: true, get: function () { return node_fs_1.statSync; } });
const node_path_1 = require("node:path");
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
function mkdirp(path) {
    return (0, promises_1.mkdir)(path, { recursive: true });
}
;
function readFile(path, encoding = 'utf8') {
    return (0, promises_1.readFile)(path, encoding);
}
function readFileSync(path, encoding = 'utf8') {
    return (0, node_fs_1.readFileSync)(path, encoding);
}
;
function copySync(sourceFile, targetFile) {
    (0, node_fs_1.writeFileSync)(targetFile, (0, node_fs_1.readFileSync)(sourceFile));
}
;
function resolve(path) {
    return (0, node_path_1.resolve)(path);
}
;
function join() {
    return node_path_1.join.apply(this, Array.prototype.slice.call(arguments));
}
;
function isFile(path) {
    try {
        return (0, node_fs_1.statSync)(path).isFile();
    }
    catch {
        // ignore
        return false;
    }
}
;
function isDirectory(path) {
    try {
        return (0, node_fs_1.statSync)(path).isDirectory();
    }
    catch {
        // ignore
        return false;
    }
}
;
async function writeFile(path, content, encoding = 'utf8') {
    await (0, promises_1.mkdir)((0, node_path_1.dirname)(path), { recursive: true });
    await (0, promises_1.writeFile)(path, content, encoding);
}
;
function writeFileSync(path, content, encoding = 'utf8') {
    (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(path), { recursive: true });
    (0, node_fs_1.writeFileSync)(path, content, encoding);
}
;
//# sourceMappingURL=file-system.js.map