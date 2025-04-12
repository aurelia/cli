"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePackageManager = void 0;
const node_child_process_1 = require("node:child_process");
const npm_which_1 = __importDefault(require("npm-which"));
const isWindows = process.platform === "win32";
class BasePackageManager {
    executableName;
    proc;
    constructor(executableName) {
        this.executableName = executableName;
    }
    install(packages = [], workingDirectory = process.cwd(), command = 'install') {
        return this.run(command, packages, workingDirectory);
    }
    run(command, args = [], workingDirectory = process.cwd()) {
        let executable = this.getExecutablePath(workingDirectory);
        if (isWindows) {
            executable = JSON.stringify(executable); // Add quotes around path
        }
        return new Promise((resolve, reject) => {
            this.proc = (0, node_child_process_1.spawn)(executable, [command, ...args], { stdio: "inherit", cwd: workingDirectory, shell: isWindows })
                .on('close', resolve)
                .on('error', reject);
        });
    }
    getExecutablePath(directory) {
        try {
            return (0, npm_which_1.default)(directory).sync(this.executableName);
        }
        catch {
            return null;
        }
    }
    isAvailable(directory) {
        return !!this.getExecutablePath(directory);
    }
}
exports.BasePackageManager = BasePackageManager;
;
//# sourceMappingURL=base-package-manager.js.map