import * as path from 'node:path';
import { Configuration } from '../configuration';
import { type Bundler } from './bundler';
import { type Bundle } from './bundle';
import { type LoaderPlugin } from './loader-plugin';

export type LoaderOptions = Omit<AureliaJson.ILoader, 'plugins'> & { plugins: LoaderPlugin[] };
type LoaderBundlesConfig = { bundles?: Record<string, string[]>; map: Omit<Record<string, string>, 'bundles'>};
type LoaderConfig = AureliaJson.ILoaderConfig & Partial<LoaderBundlesConfig>;

export function createLoaderCode(platform: AureliaJson.ITarget, bundler: Bundler) {
  let loaderCode: string;
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
};

export function createLoaderConfig(platform: AureliaJson.ITarget, bundler: Bundler) {
  let loaderConfig: LoaderConfig | undefined;
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
};

function createRequireJSConfig(platform: AureliaJson.ITarget, bundler: Bundler) {
  const loaderOptions = bundler.loaderOptions;
  const loaderConfig = bundler.loaderConfig;
  const bundles = bundler.bundles;
  const configName = loaderOptions.configTarget;
  const bundleMetadata: Record<string, string[]> = {};
  const includeBundles = shouldIncludeBundleMetadata(bundles, loaderOptions);
  const config: LoaderConfig = Object.assign({}, loaderConfig);
  let location = platform.baseUrl || platform.output;

  if (platform.useAbsolutePath) {
    location = platform.baseUrl ? location : '/' + location;
  } else {
    location = '../' + location;
  }

  for (let i = 0; i < bundles.length; ++i) {
    const currentBundle = bundles[i];
    const currentName = currentBundle.config.name;
    const buildOptions = new Configuration(currentBundle.config.options, bundler.buildOptions.getAllOptions());
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

function createSystemJSConfig(platform: AureliaJson.ITarget, bundler?: Bundler) {
  const loaderOptions = bundler.loaderOptions;
  const bundles = bundler.bundles;
  const configBundleName = loaderOptions.configTarget;
  const includeBundles = shouldIncludeBundleMetadata(bundles, loaderOptions);
  const location = platform.baseUrl || platform.output;
  const systemConfig = Object.assign({}, loaderOptions.config);

  const bundlesConfig = bundles.map(bundle => systemJSConfigForBundle(bundle, bundler, location, includeBundles))
    .filter(bundle => bundle.name !== configBundleName)
    .reduce((c, bundle) => bundle.addBundleConfig(c), { map: { 'text': 'text' } } as LoaderBundlesConfig);

  return Object.assign(systemConfig, bundlesConfig);
};

function shouldIncludeBundleMetadata(bundles: Bundle[], loaderOptions: LoaderOptions) {
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

function systemJSConfigForBundle(bundle: Bundle, bundler: Bundler, location: string, includeBundles: boolean) {
  const buildOptions = new Configuration(bundle.config.options, bundler.buildOptions.getAllOptions());
  const mapTarget = location + '/' + bundle.moduleId + (buildOptions.isApplicable('rev') && bundle.hash ? '-' + bundle.hash : '') + path.extname(bundle.config.name);
  const moduleId = bundle.moduleId;
  const bundledModuleIds = bundle.getBundledModuleIds();

  return {
    name: bundle.config.name,
    addBundleConfig: function(config: LoaderBundlesConfig) {
      config.map[moduleId] = mapTarget;
      if (includeBundles) {
        config.bundles = (config.bundles || {});
        config.bundles[moduleId] = bundledModuleIds;
      }

      return config;
    }
  };
}
