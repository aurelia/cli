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
exports.PackageInstaller = void 0;
const path = __importStar(require("node:path"));
const fs = __importStar(require("../file-system"));
const aurelia_logging_1 = require("aurelia-logging");
const logger = (0, aurelia_logging_1.getLogger)('Package-installer');
class PackageInstaller {
    project;
    _packageManager;
    constructor(project) {
        this.project = project;
    }
    determinePackageManager() {
        if (this._packageManager)
            return this._packageManager;
        let packageManager = this.project.packageManager;
        if (!packageManager && fs.existsSync(path.resolve(process.cwd(), './yarn.lock'))) {
            // Have to make best guess on yarn.
            // If user is using yarn, then we use npm to install package,
            // it will highly likely end in error.
            packageManager = 'yarn';
        }
        if (!packageManager) {
            packageManager = 'npm';
        }
        this._packageManager = packageManager;
        return packageManager;
    }
    async install(packages) {
        let packageManager = this.determinePackageManager();
        let Ctor;
        logger.info(`Using '${packageManager}' to install the package(s). You can change this by setting the 'packageManager' property in the aurelia.json file to 'npm' or 'yarn'.`);
        try {
            Ctor = (await Promise.resolve(`${`../package-managers/${packageManager}`}`).then(s => __importStar(require(s)))).default;
        }
        catch (e) {
            logger.error(`Could not load the ${packageManager} package installer. Falling back to NPM`, e);
            packageManager = 'npm';
            Ctor = (await Promise.resolve(`${`../package-managers/${packageManager}`}`).then(s => __importStar(require(s)))).default;
        }
        const installer = new Ctor();
        logger.info(`[${packageManager}] installing ${packages}. It would take a while.`);
        return installer.install(packages);
    }
}
exports.PackageInstaller = PackageInstaller;
;
//# sourceMappingURL=package-installer.js.map