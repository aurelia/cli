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
exports.createLoaderCode = createLoaderCode;
exports.createLoaderConfig = createLoaderConfig;
exports.createRequireJSConfig = createRequireJSConfig;
exports.createSystemJSConfig = createSystemJSConfig;
const path = __importStar(require("node:path"));
const configuration_1 = require("../configuration");
function createLoaderCode(platform, bundler) {
    let loaderCode;
    const loaderOptions = bundler.loaderOptions;
    switch (loaderOptions.type) {
        case 'require':
            loaderCode = 'requirejs.config(' + JSON.stringify(createRequireJSConfig(platform, bundler), null, 2) + ')';
            break;
        case 'system':
            loaderCode = 'window.define=SystemJS.amdDefine; window.require=window.requirejs=SystemJS.amdRequire; SystemJS.config(' + JSON.stringify(createSystemJSConfig(platform, bundler), null, 2) + ');';
            break;
        default:
            //TODO: Enhancement: Look at a designated folder for any custom configurations
            throw new Error(`Loader configuration style ${loaderOptions.type} is not supported.`);
    }
    return loaderCode;
}
;
function createLoaderConfig(platform, bundler) {
    let loaderConfig;
    const loaderOptions = bundler.loaderOptions;
    switch (loaderOptions.type) {
        case 'require':
            loaderConfig = createRequireJSConfig(platform, bundler);
            break;
        case 'system':
            loaderConfig = createSystemJSConfig(platform);
            break;
        default:
            //TODO: Enhancement: Look at a designated folder for any custom configurations
            throw new Error(`Loader configuration style ${loaderOptions.type} is not supported.`);
    }
    return loaderConfig;
}
;
function createRequireJSConfig(platform, bundler) {
    const loaderOptions = bundler.loaderOptions;
    const loaderConfig = bundler.loaderConfig;
    const bundles = bundler.bundles;
    const configName = loaderOptions.configTarget;
    const bundleMetadata = {};
    const includeBundles = shouldIncludeBundleMetadata(bundles, loaderOptions);
    const config = Object.assign({}, loaderConfig);
    let location = platform.baseUrl || platform.output;
    if (platform.useAbsolutePath) {
        location = platform.baseUrl ? location : '/' + location;
    }
    else {
        location = '../' + location;
    }
    for (let i = 0; i < bundles.length; ++i) {
        const currentBundle = bundles[i];
        const currentName = currentBundle.config.name;
        const buildOptions = new configuration_1.Configuration(currentBundle.config.options, bundler.buildOptions.getAllOptions());
        if (currentName === configName) { //skip over the vendor bundle
            continue;
        }
        if (includeBundles) {
            bundleMetadata[currentBundle.moduleId] = currentBundle.getBundledModuleIds();
        }
        //If build revisions are enabled, append the revision hash to the appropriate module id
        config.paths[currentBundle.moduleId] = location + '/' + currentBundle.moduleId + (buildOptions.isApplicable('rev') && currentBundle.hash ? '-' + currentBundle.hash : '');
    }
    if (includeBundles) {
        config.bundles = bundleMetadata;
    }
    return config;
}
;
function createSystemJSConfig(platform, bundler) {
    const loaderOptions = bundler.loaderOptions;
    const bundles = bundler.bundles;
    const configBundleName = loaderOptions.configTarget;
    const includeBundles = shouldIncludeBundleMetadata(bundles, loaderOptions);
    const location = platform.baseUrl || platform.output;
    const systemConfig = Object.assign({}, loaderOptions.config);
    const bundlesConfig = bundles.map(bundle => systemJSConfigForBundle(bundle, bundler, location, includeBundles))
        .filter(bundle => bundle.name !== configBundleName)
        .reduce((c, bundle) => bundle.addBundleConfig(c), { map: { 'text': 'text' } });
    return Object.assign(systemConfig, bundlesConfig);
}
;
function shouldIncludeBundleMetadata(bundles, loaderOptions) {
    const setting = loaderOptions.includeBundleMetadataInConfig;
    if (typeof setting === 'string') {
        switch (setting.toLowerCase()) {
            case 'auto':
                return bundles.length > 1;
            case 'true':
                return true;
            default:
                return false;
        }
    }
    return setting === true;
}
function systemJSConfigForBundle(bundle, bundler, location, includeBundles) {
    const buildOptions = new configuration_1.Configuration(bundle.config.options, bundler.buildOptions.getAllOptions());
    const mapTarget = location + '/' + bundle.moduleId + (buildOptions.isApplicable('rev') && bundle.hash ? '-' + bundle.hash : '') + path.extname(bundle.config.name);
    const moduleId = bundle.moduleId;
    const bundledModuleIds = bundle.getBundledModuleIds();
    return {
        name: bundle.config.name,
        addBundleConfig: function (config) {
            config.map[moduleId] = mapTarget;
            if (includeBundles) {
                config.bundles = (config.bundles || {});
                config.bundles[moduleId] = bundledModuleIds;
            }
            return config;
        }
    };
}
//# sourceMappingURL=loader.js.map