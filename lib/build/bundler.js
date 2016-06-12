"use strict";
const Bundle = require('./bundle').Bundle;
const BundledSource = require('./bundled-source').BundledSource;
const CLIOptions = require('../cli-options').CLIOptions;
const LoaderPlugin = require('./loader-plugin').LoaderPlugin;

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
      baseUrl: this.loaderOptions.baseUrl || project.paths.root,
      paths: {},
      packages: [],
      stubModules: []
    };

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

  getItemByPath(path) {
    return this.itemLookup[path];
  }

  addFile(file, inclusion) {
    let item = new BundledSource(this, file);
    this.itemLookup[item.path] = item;
    this.items.push(item);

    if (inclusion) {
      inclusion.addItem(item);
    } else {
      subsume(this.bundles, item);
    }
  }

  updateFile(file, inclusion) {
    let found = this.itemLookup[file.path];

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

      return description;
    });
  }

  write(destination) {
    return Promise.all(this.bundles.map(x => x.transform()))
      .then(() => Promise.all(this.bundles.map(x => x.write(destination))));
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
