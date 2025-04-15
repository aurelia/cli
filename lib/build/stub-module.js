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
exports.stubModule = stubModule;
const path = __importStar(require("node:path"));
const Utils = __importStar(require("./utils"));
const aurelia_logging_1 = require("aurelia-logging");
const logger = (0, aurelia_logging_1.getLogger)('StubNodejs');
// stub core Node.js modules based on https://github.com/webpack/node-libs-browser/blob/master/index.js
// no need stub for following modules, they got same name on npm package
//
// assert
// buffer
// events
// punycode
// process
// string_decoder
// url
// util
// fail on following core modules has no stub
const UNAVAIABLE_CORE_MODULES = [
    'child_process',
    'cluster',
    'dgram',
    'dns',
    // 'fs',
    'net',
    'readline',
    'repl',
    'tls'
];
const EMPTY_MODULE = 'define(function(){return {};});';
async function resolvePath(packageName, root) {
    const rel = await Utils.resolvePackagePath(packageName);
    return path.relative(root, rel).replace(/\\/g, '/');
}
// note all paths here assumes local node_modules folder
async function stubModule(moduleId, root) {
    // with subfix -browserify
    if (['crypto', 'https', 'os', 'path', 'stream', 'timers', 'tty', 'vm'].indexOf(moduleId) !== -1) {
        return { name: moduleId, path: await resolvePath(`${moduleId}-browserify`, root) };
    }
    if (moduleId === 'domain') {
        logger.warn('core Node.js module "domain" is deprecated');
        return { name: 'domain', path: await resolvePath('domain-browser', root) };
    }
    if (moduleId === 'http') {
        return { name: 'http', path: await resolvePath('stream-http', root) };
    }
    if (moduleId === 'querystring') {
        return { name: 'querystring', path: await resolvePath('querystring-browser-stub', root) };
    }
    if (moduleId === 'fs') {
        return { name: 'fs', path: await resolvePath('fs-browser-stub', root) };
    }
    if (moduleId === 'sys') {
        logger.warn('core Node.js module "sys" is deprecated, the stub is disabled in CLI bundler due to conflicts with "util"');
    }
    if (moduleId === 'zlib') {
        return { name: 'zlib', path: await resolvePath('browserify-zlib', root) };
    }
    if (UNAVAIABLE_CORE_MODULES.indexOf(moduleId) !== -1) {
        logger.warn(`No avaiable stub for core Node.js module "${moduleId}", stubbed with empty module`);
        return EMPTY_MODULE;
    }
    // https://github.com/defunctzombie/package-browser-field-spec
    // {"module-a": false}
    // replace with special placeholder __ignore__
    if (moduleId === '__ignore__') {
        return EMPTY_MODULE;
    }
    if (moduleId === '__inject_css__') {
        return {
            name: '__inject_css__',
            path: await resolvePath('aurelia-cli', root),
            main: 'lib/build/inject-css'
        };
    }
}
;
//# sourceMappingURL=stub-module.js.map