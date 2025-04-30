const path = require('path');

const Configuration = require('../configuration').Configuration;

exports.createLoaderCode = function createLoaderCode(platform, bundler) {
  let loaderCode;
  let loaderOptions = bundler.loaderOptions;

  switch (loaderOptions.type) {
  case 'require':
    loaderCode = 'requirejs.config(' + JSON.stringify(exports.createRequireJSConfig(platform, bundler), null, 2) + ')';
    break;
  case 'system':
    loaderCode = 'window.define=SystemJS.amdDefine; window.require=window.requirejs=SystemJS.amdRequire; SystemJS.config(' + JSON.stringify(exports.createSystemJSConfig(platform, bundler), null, 2) + ');';
    break;
  default:
    //TODO: Enhancement: Look at a designated folder for any custom configurations
    throw new Error(`Loader configuration style ${loaderOptions.type} is not supported.`);
  }

  return loaderCode;
};

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
};

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
    location = platform.baseUrl ? location : '/' + location;
  } else {
    location = '../' + location;
  }

  for (let i = 0; i < bundles.length; ++i) {
    let currentBundle = bundles[i];
    let currentName = currentBundle.config.name;
    let buildOptions = new Configuration(currentBundle.config.options, bundler.buildOptions.getAllOptions());
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
};

exports.createSystemJSConfig = function createSystemJSConfig(platform, bundler) {
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
};

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

function systemJSConfigForBundle(bundle, bundler, location, includeBundles) {
  const buildOptions = new Configuration(bundle.config.options, bundler.buildOptions.getAllOptions());
  const mapTarget = location + '/' + bundle.moduleId + (buildOptions.isApplicable('rev') && bundle.hash ? '-' + bundle.hash : '') + path.extname(bundle.config.name);
  const moduleId = bundle.moduleId;
  const bundledModuleIds = bundle.getBundledModuleIds();

  return {
    name: bundle.config.name,
    addBundleConfig: function(config) {
      config.map[moduleId] = mapTarget;
      if (includeBundles) {
        config.bundles = (config.bundles || {});
        config.bundles[moduleId] = bundledModuleIds;
      }

      return config;
    }
  };
}
