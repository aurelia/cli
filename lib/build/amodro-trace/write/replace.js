"use strict";
// browser replacement
// https://github.com/defunctzombie/package-browser-field-spec
// see bundled-source.js for more details
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
exports.replace = replace;
// and also dep string cleanup
// remove tailing '/', '.js'
const meriyah = __importStar(require("meriyah"));
const ast_matcher_1 = require("../../ast-matcher");
// it is definitely a named AMD module at this stage
var amdDep = (0, ast_matcher_1.astMatcher)('define(__str, [__anl_deps], __any)');
var cjsDep = (0, ast_matcher_1.astMatcher)('require(__any_dep)');
var isUMD = (0, ast_matcher_1.astMatcher)('typeof define === "function" && define.amd');
var isUMD2 = (0, ast_matcher_1.astMatcher)('typeof define == "function" && define.amd');
function replace(options) {
    options = options || {};
    return function (context, moduleName, filePath, contents) {
        const replacement = options.replacement;
        const toReplace = [];
        const _find = node => {
            if (node.type !== 'Literal')
                return;
            let dep = node.value;
            // remove tailing '/'
            if (dep.endsWith('/')) {
                dep = dep.slice(0, -1);
            }
            // remove tailing '.js', but only when dep is not
            // referencing a npm package main
            if (dep.endsWith('.js') && !isPackageName(dep)) {
                dep = dep.slice(0, -3);
            }
            // browser replacement;
            if (replacement && replacement[dep]) {
                dep = replacement[dep];
            }
            if (node.value !== dep) {
                toReplace.push({
                    start: node.range[0],
                    end: node.range[1],
                    text: `'${dep}'`
                });
            }
        };
        // need node location
        const parsed = meriyah.parseScript(contents, { ranges: true, next: true, webcompat: true });
        if (isUMD(parsed) || isUMD2(parsed)) {
            // Skip lib in umd format, because browersify umd build could
            // use require('./file.js') which we should not strip .js
            return contents;
        }
        const amdMatch = amdDep(parsed);
        if (amdMatch) {
            amdMatch.forEach(result => {
                result.match.deps.forEach(_find);
            });
        }
        const cjsMatch = cjsDep(parsed);
        if (cjsMatch) {
            cjsMatch.forEach(result => {
                _find(result.match.dep);
            });
        }
        // reverse sort by "start"
        toReplace.sort((a, b) => b.start - a.start);
        toReplace.forEach(r => {
            contents = modify(contents, r);
        });
        return contents;
    };
}
;
function modify(contents, replacement) {
    return contents.slice(0, replacement.start) +
        replacement.text +
        contents.slice(replacement.end);
}
function isPackageName(path) {
    if (path.startsWith('.'))
        return false;
    const parts = path.split('/');
    // package name, or scope package name
    return parts.length === 1 || (parts.length === 2 && parts[0].startsWith('@'));
}
//# sourceMappingURL=replace.js.map