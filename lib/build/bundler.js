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
exports.Bundler = void 0;
const bundle_1 = require("./bundle");
const bundled_source_1 = require("./bundled-source");
const cli_options_1 = require("../cli-options");
const loader_plugin_1 = require("./loader-plugin");
const configuration_1 = require("../configuration");
const path = __importStar(require("node:path"));
const fs = __importStar(require("../file-system"));
const Utils = __importStar(require("./utils"));
const aurelia_logging_1 = require("aurelia-logging");
const stub_module_1 = require("./stub-module");
const logger = (0, aurelia_logging_1.getLogger)('Bundler');
class Bundler {
    project;
    packageAnalyzer;
    packageInstaller;
    bundles;
    itemLookup;
    items;
    environment;
    autoInstall;
    triedAutoInstalls;
    buildOptions;
    loaderOptions;
    loaderConfig;
    configTargetBundle;
    constructor(project, packageAnalyzer, packageInstaller) {
        this.project = project;
        this.packageAnalyzer = packageAnalyzer;
        this.packageInstaller = packageInstaller;
        this.bundles = [];
        this.itemLookup = {};
        this.items = [];
        this.environment = cli_options_1.CLIOptions.getEnvironment();
        // --auto-install is checked here instead of in app's tasks/run.js
        // this enables all existing apps to use this feature.
        this.autoInstall = cli_options_1.CLIOptions.hasFlag('auto-install');
        this.triedAutoInstalls = new Set();
        const defaultBuildOptions = {
            minify: 'stage & prod',
            sourcemaps: 'dev & stage',
            rev: false
        };
        this.buildOptions = new configuration_1.Configuration(project.build.options, defaultBuildOptions);
        this.loaderConfig = {
            baseUrl: project.paths.root,
            paths: ensurePathsRelativelyFromRoot(project.paths),
            packages: [],
            stubModules: [],
            shim: {}
        };
        Object.assign(this.loaderConfig, this.project.build.loader.config);
        const plugins = (project.build.loader.plugins || []).map(x => {
            const plugin = new loader_plugin_1.LoaderPlugin(project.build.loader.type, x);
            if (plugin.stub && this.loaderConfig.stubModules.indexOf(plugin.name) === -1) {
                this.loaderConfig.stubModules.push(plugin.name);
            }
            return plugin;
        });
        this.loaderOptions = { ...project.build.loader, plugins };
    }
    static async create(project, packageAnalyzer, packageInstaller) {
        const bundler = new Bundler(project, packageAnalyzer, packageInstaller);
        await Promise.all(project.build.bundles.map(x => bundle_1.Bundle.create(bundler, x).then(bundle => {
            bundler.addBundle(bundle);
        })));
        //Order the bundles so that the bundle containing the config is processed last.
        if (bundler.bundles.length) {
            const configTargetBundleIndex = bundler.bundles.findIndex(x_1 => x_1.config.name === bundler.loaderOptions.configTarget);
            bundler.bundles.splice(bundler.bundles.length, 0, bundler.bundles.splice(configTargetBundleIndex, 1)[0]);
            bundler.configTargetBundle = bundler.bundles[bundler.bundles.length - 1];
        }
        return bundler;
    }
    itemIncludedInBuild(item) {
        if (typeof item === 'string' || !item.env) {
            return true;
        }
        const value = item.env;
        const parts = value.split('&').map(x => x.trim().toLowerCase());
        return parts.indexOf(this.environment) !== -1;
    }
    addFile(file, inclusion) {
        const key = normalizeKey(file.path);
        let found = this.itemLookup[key];
        if (!found) {
            found = new bundled_source_1.BundledSource(this, file);
            this.itemLookup[key] = found;
            this.items.push(found);
        }
        if (inclusion) {
            inclusion.addItem(found);
        }
        else {
            subsume(this.bundles, found);
        }
        return found;
    }
    updateFile(file, inclusion) {
        const found = this.itemLookup[normalizeKey(file.path)];
        if (found) {
            found.update(file);
        }
        else {
            this.addFile(file, inclusion);
        }
    }
    addBundle(bundle) {
        this.bundles.push(bundle);
    }
    async configureDependency(dependency) {
        try {
            return await analyzeDependency(this.packageAnalyzer, dependency);
        }
        catch (e) {
            const nodeId = typeof dependency === 'string' ? dependency : dependency.name;
            if (this.autoInstall && !this.triedAutoInstalls.has(nodeId)) {
                this.triedAutoInstalls.add(nodeId);
                await this.packageInstaller.install([nodeId]);
                // try again after install
                return await this.configureDependency(nodeId);
            }
            logger.error(`Unable to analyze ${nodeId}`);
            logger.info(e);
            throw e;
        }
    }
    async build(opts) {
        let onRequiringModule, onNotBundled;
        if (opts?.onRequiringModule && typeof opts.onRequiringModule === 'function') {
            onRequiringModule = opts.onRequiringModule;
        }
        if (opts?.onNotBundled && typeof opts.onNotBundled === 'function') {
            onNotBundled = opts.onNotBundled;
        }
        const doTransform = async (initSet) => {
            const deps = new Set(initSet);
            this.items.forEach(item => {
                // Transformed items will be ignored
                // by flag item.requiresTransform.
                const _deps = item.transform();
                if (_deps)
                    _deps.forEach(d => deps.add(d));
            });
            if (deps.size) {
                // removed all fulfilled deps
                this.bundles.forEach(bundle => {
                    // Only need to check raw module ids, not nodeIdCompat aliases.
                    // Because deps here are clean module ids.
                    bundle.getRawBundledModuleIds().forEach(id => {
                        deps.delete(id);
                        if (id.endsWith('/index')) {
                            // if id is 'resources/index', shortId is 'resources'.
                            const shortId = id.slice(0, -6);
                            if (deps.delete(shortId)) {
                                // ok, someone try to use short name
                                bundle.addAlias(shortId, id);
                            }
                        }
                    });
                });
            }
            if (deps.size) {
                const _leftOver = new Set();
                await Utils.runSequentially(Array.from(deps).sort(), async (d) => {
                    try {
                        const result = await (onRequiringModule?.(d) ?? undefined);
                        // ignore this module id
                        if (result === false)
                            return;
                        // require other module ids instead
                        if (Array.isArray(result) && result.length) {
                            result.forEach(dd => _leftOver.add(dd));
                            return;
                        }
                        // got full content of this module
                        if (typeof result === 'string') {
                            let fakeFilePath = path.resolve(this.project.paths.root, d);
                            const ext = path.extname(d).toLowerCase();
                            if (!ext || Utils.knownExtensions.indexOf(ext) === -1) {
                                fakeFilePath += '.js';
                            }
                            // we use '/' as separator even on Windows
                            // because module id is using '/' as separator
                            this.addFile({
                                path: fakeFilePath,
                                contents: result
                            });
                            return;
                        }
                        // process normally if result is not recognizable
                        await this.addMissingDep(d);
                    }
                    catch (err) {
                        logger.error(err);
                        await this.addMissingDep(d);
                    }
                });
                await doTransform(_leftOver);
            }
        };
        logger.info('Tracing files ...');
        try {
            await doTransform();
            if (onNotBundled) {
                const notBundled = this.items.filter(t => !t.includedIn);
                if (notBundled.length)
                    onNotBundled(notBundled);
            }
        }
        catch (e) {
            logger.error('Failed to do transforms');
            logger.info(e);
            throw e;
        }
    }
    async write() {
        await Promise.all(this.bundles.map(bundle => bundle.write(this.project.build.targets[0])));
        for (let i = this.bundles.length; i--;) {
            await this.bundles[i].writeBundlePathsToIndex(this.project.build.targets[0]);
        }
    }
    getDependencyInclusions() {
        return this.bundles.reduce((a, b) => a.concat(b.getDependencyInclusions()), []);
    }
    async addMissingDep(id) {
        const localFilePath = path.resolve(this.project.paths.root, id);
        // load additional local file missed by gulp tasks,
        // this could be json/yaml file that user wanted in
        // aurelia.json 'text!' plugin
        if (Utils.couldMissGulpPreprocess(id) && fs.existsSync(localFilePath)) {
            this.addFile({
                path: localFilePath,
                contents: fs.readFileSync(localFilePath)
            });
            return;
        }
        await this.addNpmResource(id);
    }
    async addNpmResource(id) {
        // match scoped npm module and normal npm module
        const match = id.match(/^((?:@[^/]+\/[^/]+)|(?:[^@][^/]*))(\/.+)?$/);
        if (!match) {
            logger.error(`Not valid npm module Id: ${id}`);
            return Promise.resolve();
        }
        const nodeId = match[1];
        const resourceId = match[2] && match[2].slice(1);
        const depInclusion = this.getDependencyInclusions().find(di => di.description.name === nodeId);
        if (depInclusion) {
            if (resourceId) {
                return depInclusion.traceResource(resourceId);
            }
            return depInclusion.traceMain();
        }
        const stub = await (0, stub_module_1.stubModule)(nodeId, this.project.paths.root);
        if (typeof stub === 'string') {
            this.addFile({
                path: path.resolve(this.project.paths.root, nodeId + '.js'),
                contents: stub
            });
            return Promise.resolve();
        }
        try {
            const description = await this.configureDependency(stub || nodeId);
            if (resourceId) {
                description.loaderConfig.lazyMain = true;
            }
            if (stub) {
                logger.info(`Auto stubbing module: ${nodeId}`);
            }
            else {
                logger.info(`Auto tracing ${description.banner}`);
            }
            const inclusion = await this.configTargetBundle.addDependency(description);
            // Now dependencyInclusion is created
            // Try again to use magical traceResource
            if (resourceId) {
                return await inclusion.traceResource(resourceId);
            }
        }
        catch (e) {
            logger.error('Failed to add Nodejs module ' + id);
            logger.info(e);
            // don't stop
        }
    }
}
exports.Bundler = Bundler;
;
function analyzeDependency(packageAnalyzer, dependency) {
    if (typeof dependency === 'string') {
        return packageAnalyzer.analyze(dependency);
    }
    return packageAnalyzer.reverseEngineer(dependency);
}
function subsume(bundles, item) {
    for (let i = 0, ii = bundles.length; i < ii; ++i) {
        if (bundles[i].trySubsume(item)) {
            return;
        }
    }
    logger.warn(item.path + ' is not captured by any bundle file. You might need to adjust the bundles source matcher in aurelia.json.');
}
function normalizeKey(p) {
    return path.normalize(p);
}
function ensurePathsRelativelyFromRoot(p) {
    const keys = Object.keys(p);
    const original = JSON.stringify(p, null, 2);
    let warn = false;
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key !== 'root' && p[key].indexOf(p.root + '/') === 0) {
            warn = true;
            p[key] = p[key].slice(p.root.length + 1);
        }
        // trim off last '/'
        if (p[key].endsWith('/')) {
            p[key] = p[key].slice(0, -1);
        }
    }
    if (warn) {
        logger.warn('Warning: paths in the "paths" object in aurelia.json must be relative from the root path. Change ');
        logger.warn(original);
        logger.warn('to: ');
        logger.warn(JSON.stringify(p, null, 2));
    }
    return p;
}
//# sourceMappingURL=bundler.js.map