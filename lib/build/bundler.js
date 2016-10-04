"use strict";
const Bundle = require('./bundle').Bundle;
const BundledSource = require('./bundled-source').BundledSource;
const CLIOptions = require('../cli-options').CLIOptions;
const LoaderPlugin = require('./loader-plugin').LoaderPlugin;
const path = require('path');

exports.Bundler = class {
  constructor(project, packageAnalyzer) {
    this.project = project;
    this.packageAnalyzer = packageAnalyzer;
    this.bundles = [];
    this.items = [];
    this.itemLookup = {};
    this.environment = CLIOptions.getEnvironment();

    let defaultBuildOptions = {
      minify: "stage & prod",
      sourcemaps: "dev & stage",
      rev: false
    };

    this.buildOptions = this.interpretBuildOptions(project.build.options, defaultBuildOptions);
    this.loaderOptions = project.build.loader;

    this.loaderConfig = {
      baseUrl: project.paths.root,
      paths: {},
      packages: [],
      stubModules: [],
      shim: {}
    };
    Object.assign(this.loaderConfig, this.project.build.loader.config);

    this.loaderOptions.plugins = (this.loaderOptions.plugins || []).map(x => {
      let plugin = new LoaderPlugin(this, x);

      if (plugin.stub && this.loaderConfig.stubModules.indexOf(plugin.name) === -1) {
        this.loaderConfig.stubModules.push(plugin.name);
      }

      return plugin;
    });
  }

  static create(project, packageAnalyzer) {
    let bundler = new exports.Bundler(project, packageAnalyzer);

    return Promise.all(
      project.build.bundles.map(x => Bundle.create(bundler, x).then(bundle => {
        bundler.addBundle(bundle);
      }))
    ).then(() => bundler);
  }

  interpretBuildOptions(options, defaultOptions) {
    let env = this.environment;
    options = Object.assign({}, defaultOptions, options);

    for (let key in options) {
      let value = options[key];

      if (typeof value === 'boolean') {
        continue;
      } else if (typeof value === 'string') {
        let parts = value.split('&').map(x => x.trim().toLowerCase());
        options[key] = parts.indexOf(env) !== -1;
      } else {
        options[key] = false;
      }
    }

    return options;
  }

  itemIncludedInBuild(item) {
    if (typeof item === 'string' || !item.env) {
      return true;
    }

    let value = item.env;
    let parts = value.split('&').map(x => x.trim().toLowerCase());

    return parts.indexOf(this.environment) !== -1;
  }

  getItemByPath(path) {
    return this.itemLookup[normalizeKey(path)];
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
    return analyzeDependency(this.packageAnalyzer, dependency).then(description => {
      let loaderConfig = description.loaderConfig;

      if (loaderConfig.main) {
        this.loaderConfig.packages.push({
          name: loaderConfig.name,
          location: loaderConfig.path,
          main : loaderConfig.main
        });
      } else {
        this.loaderConfig.paths[loaderConfig.name] = loaderConfig.path;
      }

      if (loaderConfig.deps || loaderConfig.exports) {
        let shim = this.loaderConfig.shim[loaderConfig.name] = {};

        if (loaderConfig.deps) {
          shim.deps = loaderConfig.deps;
        }

        if (loaderConfig.exports) {
          shim.exports = loaderConfig.exports;
        }
      }

      return description;
    });
  }

  build() {
    let index = -1;
    let items = this.bundles;

    function doTransform() {
      index++;

      if (index < items.length) {
        return items[index].transform().then(doTransform);
      }

      return Promise.resolve();
    }

    return doTransform()
      .then(() => {
        //Order the bundles so that the bundle containing the config is processed last.
        let configTargetBundleIndex = this.bundles.findIndex(x => x.config.name == this.loaderOptions.configTarget);
        this.bundles.splice(this.bundles.length, 0, this.bundles.splice(configTargetBundleIndex, 1)[0]);
      });
  }
  
  write() {
    return Promise.all(this.bundles.map(x => x.write(this.project.build.targets[0])));
  }
}

function analyzeDependency(packageAnalyzer, dependency) {
  if (typeof dependency === 'string') {
    return packageAnalyzer.analyze(dependency);
  }

  return packageAnalyzer.reverseEngineer(dependency);
}

function subsume(bundles, item) {
  for(let i = 0, ii = bundles.length; i < ii; ++i) {
    if (bundles[i].trySubsume(item)) {
      return;
    }
  }
}

function normalizeKey(p) {
  return path.normalize(p);
}
