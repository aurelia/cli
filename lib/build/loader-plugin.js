"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoaderPlugin = void 0;
const utils_1 = require("./utils");
class LoaderPlugin {
    type;
    config;
    _test;
    get name() {
        return this.config.name;
    }
    get stub() {
        return this.config.stub;
    }
    get extensions() {
        return this.config.extensions;
    }
    get test() {
        return this.config.test;
    }
    constructor(type, config) {
        this.type = type;
        this.config = config;
        this._test = config.test ? new RegExp(config.test) : regExpFromExtensions(config.extensions);
    }
    matches(filePath) {
        return this._test.test(filePath);
    }
    transform(moduleId, filePath, contents) {
        contents = `define('${this.createModuleId(moduleId)}',[],function(){return ${JSON.stringify(contents)};});`;
        return contents;
    }
    createModuleId(moduleId) {
        // for backward compatibility, use 'text' as plugin name,
        // to not break existing app with additional json plugin in aurelia.json
        return (0, utils_1.moduleIdWithPlugin)(moduleId, 'text', this.type);
    }
}
exports.LoaderPlugin = LoaderPlugin;
;
function regExpFromExtensions(extensions) {
    return new RegExp('^.*(' + extensions.map(x => '\\' + x).join('|') + ')$');
}
//# sourceMappingURL=loader-plugin.js.map