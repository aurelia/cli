"use strict"

const path = require('path');
const LoaderPlugin = require('./loader-plugin').LoaderPlugin;

exports.createLoaderCode = function createLoaderCode(platform, bundler) {
    let loaderCode;
    let loaderOptions = bundler.loaderOptions;

    switch (loaderOptions.type) {
        case 'require':
            loaderCode = 'requirejs.config(' + JSON.stringify(exports.createRequireJSConfig(platform, bundler)) + ')';
            break;
        case 'system':
            loaderCode = exports.createSystemJSConfig(platform);
            break;
        default:
            //TODO: Enhancement: Look at a designated folder for any custom configurations
            throw new Error(`Loader configuration style ${loaderOptions.type} is not supported.`);
    }

    return loaderCode;
}

exports.createLoaderConfig = function createLoaderConfig(platform, bundler) {
    let loaderConfig;
    let loaderOptions = bundler.loaderOptions;

    switch (loaderOptions.type) {
        case 'require':
            loaderConfig = exports.createRequireJSConfig(platform, bundler);
            break;
        case 'system':
            loaderConfig = exports.createSystemJSConfig(platform);
            break;
        default:
            //TODO: Enhancement: Look at a designated folder for any custom configurations
            throw new Error(`Loader configuration style ${loaderOptions.type} is not supported.`);
    }

    return loaderConfig;
}

exports.createRequireJSConfig = function createRequireJSConfig(platform, bundler) {
    let loaderOptions = bundler.loaderOptions;
    let loaderConfig = bundler.loaderConfig;
    let bundles = bundler.bundles;
    let configName = loaderOptions.configTarget;
    let bundleMetadata = {};
    let includeBundles = shouldIncludeBundleMetadata(bundles, loaderOptions);
    let config = Object.assign({}, loaderConfig);
    let location = platform.baseUrl || platform.output;

    if (platform.useAbsolutePath) {
        location = '/' + location;
    } else {
        location = '../' + location;
    }

    for (let i = 0; i < bundles.length; ++i) {
        let currentBundle = bundles[i];
        let currentName = currentBundle.config.name;
        let buildOptions = bundler.interpretBuildOptions(currentBundle.config.options, bundler.buildOptions); 
        if (currentName === configName) { //skip over the vendor bundle
            continue;
        }

        if (includeBundles) {
            bundleMetadata[currentBundle.moduleId] = currentBundle.getBundledModuleIds();
        }
        //If build revisions are enabled, append the revision hash to the appropriate module id
        config.paths[currentBundle.moduleId] = location + '/' + currentBundle.moduleId + (buildOptions.rev && currentBundle.hash ? '-' + currentBundle.hash : '');
    }

    if (includeBundles) {
        config.bundles = bundleMetadata;
    }

    return config;
}

exports.createSystemJSConfig = function createSystemJSConfig(platform) {
    throw new Error('SystemJS is not yet supported');
}

function shouldIncludeBundleMetadata(bundles, loaderOptions) {
    let setting = loaderOptions.includeBundleMetadataInConfig;

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