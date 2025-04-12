"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Yarn = void 0;
const base_package_manager_1 = require("./base-package-manager");
class Yarn extends base_package_manager_1.BasePackageManager {
    constructor() {
        super('yarn');
    }
    install(packages = [], workingDirectory = process.cwd()) {
        return super.install(packages, workingDirectory, !packages.length ? 'install' : 'add');
    }
}
exports.Yarn = Yarn;
;
//# sourceMappingURL=yarn.js.map