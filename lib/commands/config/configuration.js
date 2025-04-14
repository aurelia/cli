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
exports.Configuration = void 0;
const os = __importStar(require("node:os"));
const file_system_1 = require("../../file-system");
class Configuration {
    options;
    aureliaJsonPath;
    project;
    constructor(options) {
        this.options = options;
        this.aureliaJsonPath = options.originalBaseDir + '/aurelia_project/aurelia.json';
        this.project = JSON.parse((0, file_system_1.readFileSync)(this.aureliaJsonPath));
    }
    configEntry(key, createKey) {
        let entry = this.project;
        const keys = key.split('.');
        if (!keys[0]) {
            return entry;
        }
        while (entry && keys.length) {
            const parsedKey = this.parsedKey(keys.shift());
            if (entry[parsedKey.value] === undefined || entry[parsedKey.value] === null) {
                if (!createKey) {
                    return entry[parsedKey.value];
                }
                const checkKey = this.parsedKey(keys.length ? keys[0] : createKey);
                if (checkKey.index) {
                    entry[parsedKey.value] = [];
                }
                else if (checkKey.key) {
                    entry[parsedKey.value] = {};
                }
            }
            entry = entry[parsedKey.value];
            // TODO: Add support for finding objects based on input values?
            // TODO: Add support for finding string in array?
        }
        return entry;
    }
    parsedKey(key) {
        if (/\[(\d+)\]/.test(key)) {
            return { index: true, key: false, value: +(RegExp.$1) };
        }
        return { index: false, key: true, value: key };
    }
    normalizeKey(key) {
        const re = /([^.])\[/;
        while (re.exec(key)) {
            key = key.replace(re, RegExp.$1 + '.[');
        }
        const keys = key.split('.');
        for (let i = 0; i < keys.length; i++) {
            if (/\[(\d+)\]/.test(keys[i])) {
                // console.log(`keys[${i}] is index: ${keys[i]}`);
            }
            else if (/\[(.+)\]/.test(keys[i])) {
                // console.log(`keys[${i}] is indexed name: ${keys[i]}`);
                keys[i] = RegExp.$1;
            }
            else {
                // console.log(`keys[${i}] is name: ${keys[i]}`);
            }
        }
        return keys.join('.');
    }
    execute(action, key, value) {
        const originalKey = key;
        key = this.normalizeKey(key);
        if (action === 'get') {
            return `Configuration key '${key}' is:` + os.EOL + JSON.stringify(this.configEntry(key), null, 2);
        }
        const keys = key.split('.');
        const parsedKey = this.parsedKey(keys.pop());
        const parent = keys.join('.');
        if (action === 'set') {
            const entry = this.configEntry(parent, parsedKey.value.toString());
            if (entry) {
                entry[parsedKey.value] = value;
            }
            else {
                console.log('Failed to set property', this.normalizeKey(originalKey), '!');
            }
        }
        else if (action === 'clear') {
            const entry = this.configEntry(parent);
            if (entry && (parsedKey.value in entry)) {
                delete entry[parsedKey.value];
            }
            else {
                console.log('No property', this.normalizeKey(originalKey), 'to clear!');
            }
        }
        else if (action === 'add') {
            const entry = this.configEntry(parent, parsedKey.value.toString());
            if (Array.isArray(entry[parsedKey.value]) && !Array.isArray(value)) {
                value = [value];
            }
            if (Array.isArray(value) && !Array.isArray(entry[parsedKey.value])) {
                entry[parsedKey.value] = (entry ? [entry[parsedKey.value]] : []);
            }
            if (Array.isArray(value)) {
                entry[parsedKey.value].push(...value);
            }
            else if (Object(value) === value) {
                if (Object(entry[parsedKey.value]) !== entry[parsedKey.value]) {
                    entry[parsedKey.value] = {};
                }
                Object.assign(entry[parsedKey.value], value);
            }
            else {
                entry[parsedKey.value] = value;
            }
        }
        else if (action === 'remove') {
            const entry = this.configEntry(parent);
            if (Array.isArray(entry) && parsedKey.index) {
                entry.splice(parsedKey.value, 1);
            }
            else if (Object(entry) === entry && parsedKey.key) {
                delete entry[parsedKey.value];
            }
            else if (!entry) {
                console.log('No property', this.normalizeKey(originalKey), 'to remove from!');
            }
            else {
                console.log("Can't remove value from", entry[parsedKey.value], '!');
            }
        }
        key = this.normalizeKey(originalKey);
        return `Configuration key '${key}' is now:` + os.EOL + JSON.stringify(this.configEntry(key), null, 2);
    }
    save(backup) {
        if (backup === undefined)
            backup = true;
        const unique = new Date().toISOString().replace(/[T\D]/g, '');
        const arr = this.aureliaJsonPath.split(/[\\/]/);
        const name = arr.pop();
        const path = arr.join('/');
        const bak = `${name}.${unique}.bak`;
        if (backup) {
            (0, file_system_1.copySync)(this.aureliaJsonPath, [path, bak].join('/'));
        }
        return (0, file_system_1.writeFile)(this.aureliaJsonPath, JSON.stringify(this.project, null, 2), 'utf8')
            .then(() => { return bak; });
    }
}
exports.Configuration = Configuration;
//# sourceMappingURL=configuration.js.map