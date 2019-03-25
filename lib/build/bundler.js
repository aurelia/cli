const Bundle = require('./bundle').Bundle;
const BundledSource = require('./bundled-source').BundledSource;
const CLIOptions = require('../cli-options').CLIOptions;
const LoaderPlugin = require('./loader-plugin').LoaderPlugin;
const Configuration = require('../configuration').Configuration;
const path = require('path');
const fs = require('../file-system');
const Utils = require('./utils');
const logger = require('aurelia-logging').getLogger('Bundler');
const stubModule = require('./stub-module');

exports.Bundler = class {
  constructor(project, packageAnalyzer, packageInstaller) {
    this.project = project;
    this.packageAnalyzer = packageAnalyzer;
    this.packageInstaller = packageInstaller;
    this.bundles = [];
    this.itemLookup = {};
    this.items = [];
    this.environment = CLIOptions.getEnvironment();
    // --auto-install is checked here instead of in app's tasks/run.js
    // this enables all existing apps to use this feature.
    this.autoInstall = CLIOptions.hasFlag('auto-install');
    this.triedAutoInstalls = new Set();

    let defaultBuildOptions = {
      minify: 'stage & prod',
      sourcemaps: 'dev & stage',
      rev: false
    };

    this.buildOptions = new Configuration(project.build.options, defaultBuildOptions);
    this.loaderOptions = project.build.loader;

    this.loaderConfig = {
      baseUrl: project.paths.root,
      paths: ensurePathsRelativelyFromRoot(project.paths || {}),
      packages: [],
      stubModules: [],
      shim: {}
    };

    Object.assign(this.loaderConfig, this.project.build.loader.config);

    this.loaderOptions.plugins = (this.loaderOptions.plugins || []).map(x => {
      let plugin = new LoaderPlugin(this.loaderOptions.type, x);

      if (plugin.stub && this.loaderConfig.stubModules.indexOf(plugin.name) === -1) {
        this.loaderConfig.stubModules.push(plugin.name);
      }

      return plugin;
    });
  }

  static create(project, packageAnalyzer, packageInstaller) {
    let bundler = new exports.Bundler(project, packageAnalyzer, packageInstaller);

    return Promise.all(
      project.build.bundles.map(x => Bundle.create(bundler, x).then(bundle => {
        bundler.addBundle(bundle);
      }))
    ).then(() => {
      //Order the bundles so that the bundle containing the config is processed last.
      if (bundler.bundles.length) {
        let configTargetBundleIndex = bundler.bundles.findIndex(x => x.config.name === bundler.loaderOptions.configTarget);
        bundler.bundles.splice(bundler.bundles.length, 0, bundler.bundles.splice(configTargetBundleIndex, 1)[0]);
        bundler.configTargetBundle = bundler.bundles[bundler.bundles.length - 1];
      }
    }).then(() => bundler);
  }

  itemIncludedInBuild(item) {
    if (typeof item === 'string' || !item.env) {
      return true;
    }

    let value = item.env;
    let parts = value.split('&').map(x => x.trim().toLowerCase());

    return parts.indexOf(this.environment) !== -1;
  }

  addFile(file, inclusion) {
    let key =  normalizeKey(file.path);
    let found = this.itemLookup[key];

    if (!found) {
      found = new BundledSource(this, file);
      this.itemLookup[key] = found;
      this.items.push(found);
    }

    if (inclusion) {
      inclusion.addItem(found);
    } else {
      subsume(this.bundles, found);
    }

    return found;
  }

  updateFile(file, inclusion) {
    let found = this.itemLookup[normalizeKey(file.path)];

    if (found) {
      found.update(file);
    } else {
      this.addFile(file, inclusion);
    }
  }

  addBundle(bundle) {
    this.bundles.push(bundle);
  }

  configureDependency(dependency) {
    return analyzeDependency(this.packageAnalyzer, dependency)
      .catch(e => {
        let nodeId = dependency.name || dependency;

        if (this.autoInstall && !this.triedAutoInstalls.has(nodeId)) {
          this.triedAutoInstalls.add(nodeId);
          return this.packageInstaller.install([nodeId])
            // try again after install
            .then(() => this.configureDependency(nodeId));
        }

        logger.error(`Unable to analyze ${nodeId}`);
        logger.info(e);
        throw e;
      });
  }

  build(opts) {
    let onRequiringModule;
    if (opts && typeof opts.onRequiringModule === 'function') {
      onRequiringModule = opts.onRequiringModule;
    }

    const doTranform = (initSet) => {
      let deps = new Set(initSet);

      this.items.forEach(item => {
        // Transformed items will be ignored
        // by flag item.requiresTransform.
        let _deps = item.transform();
        if (_deps) _deps.forEach(d => deps.add(d));
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
              let shortId = id.slice(0, -6);
              if (deps.delete(shortId)) {
                // ok, someone try to use short name
                bundle.addAlias(shortId, id);
              }
            }
          });
        });
      }

      if (deps.size) {
        let _leftOver = new Set();

        return Utils.runSequentially(
          Array.from(deps).sort(),
          d => {
            return new Promise(resolve => {
              resolve(onRequiringModule && onRequiringModule(d));
            }).then(
              result => {
                // ignore this module id
                if (result === false) return;

                // require other module ids instead
                if (Array.isArray(result) && result.length) {
                  result.forEach(dd => _leftOver.add(dd));
                  return;
                }

                // got full content of this module
                if (typeof result === 'string') {
                  let fakeFilePath = path.resolve(this.project.paths.root, d);

                  let ext = path.extname(d).toLowerCase();
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
                return this.addMissingDep(d);
              },
              // proceed normally after error
              err => {
                logger.error(err);
                return this.addMissingDep(d);
              }
            );
          }
        ).then(() => doTranform(_leftOver));
      }

      return Promise.resolve();
    };

    logger.info('Tracing files ...');

    return Promise.resolve()
      .then(() => doTranform())
      .catch(e => {
        logger.error('Failed to do transforms');
        logger.info(e);
        throw e;
      });
  }

  write() {
    return Promise.all(this.bundles.map(bundle => bundle.write(this.project.build.targets[0])))
      .then(async() => {
        for (let i = this.bundles.length; i--; ) {
          await this.bundles[i].writeBundlePathsToIndex(this.project.build.targets[0]);
        }
      });
  }

  getDependencyInclusions() {
    return this.bundles.reduce((a, b) => a.concat(b.getDependencyInclusions()), []);
  }

  addMissingDep(id) {
    const localFilePath = path.resolve(this.project.paths.root, id);

    // load additional local file missed by gulp tasks,
    // this could be json/yaml file that user wanted in
    // aurelia.json 'text!' plugin
    if (Utils.couldMissGulpPreprocess(id) && fs.existsSync(localFilePath)) {
      this.addFile({
        path: localFilePath,
        contents: fs.readFileSync(localFilePath)
      });
      return Promise.resolve();
    }

    return this.addNpmResource(id);
  }

  addNpmResource(id) {
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

    let stub = stubModule(nodeId, this.project.paths.root);
    if (typeof stub === 'string') {
      this.addFile({
        path: path.resolve(this.project.paths.root, nodeId + '.js'),
        contents: stub
      });
      return Promise.resolve();
    }

    return this.configureDependency(stub || nodeId)
      .then(description => {
        if (resourceId) {
          description.loaderConfig.lazyMain = true;
        }

        if (stub) {
          logger.info(`Auto stubbing module: ${nodeId}`);
        } else {
          logger.info(`Auto tracing ${description.banner}`);
        }

        return this.configTargetBundle.addDependency(description);
      })
      .then(inclusion => {
        // now dependencyInclusion is created
        // try again to use magical traceResource
        if (resourceId) {
          return inclusion.traceResource(resourceId);
        }
      })
      .catch(e => {
        logger.error('Failed to add Nodejs module ' + id);
        logger.info(e);
        // don't stop
      });
  }
};

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
}

function normalizeKey(p) {
  return path.normalize(p);
}

function ensurePathsRelativelyFromRoot(p) {
  let keys = Object.keys(p);
  let original = JSON.stringify(p, null, 2);
  let warn = false;

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
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
