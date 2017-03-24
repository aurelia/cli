'use strict';
const path = require('path');
const fs = require('./file-system');
const string = require('./string');
const ProjectItem = require('./project-item').ProjectItem;
const rfc6902 = require('rfc6902');

exports.Project = class {
  static establish(ui, dir) {
    process.chdir(dir);

    return fs.readFile(path.join(dir, 'aurelia_project', 'aurelia.json')).then(model => {
      return fs.readFile(path.join(dir, 'package.json')).then(pack => {
        return new exports.Project(ui, dir, JSON.parse(model.toString()), JSON.parse(pack.toString()));
      });
    });
  }

  constructor(ui, directory, model, pack) {
    this.ui = ui;
    this.directory = directory;
    this.model = model;
    this.package = pack;
    this.taskDirectory = path.join(directory, 'aurelia_project/tasks');
    this.generatorDirectory = path.join(directory, 'aurelia_project/generators');
    this.aureliaJSONPath = path.join(directory, 'aurelia_project', 'aurelia.json');

    this.locations = Object.keys(model.paths).map(key => this[key] = ProjectItem.directory(model.paths[key]));
    this.locations.push(this.generators = ProjectItem.directory('aurelia_project/generators'));
    this.locations.push(this.tasks = ProjectItem.directory('aurelia_project/tasks'));
  }

  commitChanges() {
    return Promise.all(this.locations.map(x => x.create(this.ui, this.directory)));
  }

  makeFileName(name) {
    return string.sluggify(name);
  }

  makeClassName(name) {
    return string.upperCamelCase(name);
  }

  makeFunctionName(name) {
    return string.lowerCamelCase(name);
  }

  installTranspiler() {
    switch (this.model.transpiler.id) {
    case 'babel':
      installBabel();
      break;
    case 'typescript':
      installTypeScript();
      break;
    default:
      throw new Error(`${this.model.transpiler.displayName} is not a supported transpiler.`);
    }
  }

  getExport(m, name) {
    return name ? m[name] : m.default;
  }

  getGeneratorMetadata() {
    return getMetadata(this.generatorDirectory);
  }

  getTaskMetadata() {
    return getMetadata(this.taskDirectory);
  }

  resolveGenerator(name) {
    let potential = path.join(this.generatorDirectory, `${name}${this.model.transpiler.fileExtension}`);
    return fs.stat(potential).then(() => potential).catch(() => null);
  }

  resolveTask(name) {
    let potential = path.join(this.taskDirectory, `${name}${this.model.transpiler.fileExtension}`);
    return fs.stat(potential).then(() => potential).catch(() => null);
  }

  addDependency(bundle, dependency) {
    if (!bundle.dependencies) {
      bundle.dependencies = [];
    }

    bundle.dependencies.push(dependency);
  }

  addOrReplaceDependency(bundle, dependency) {
    let name = (dependency.name || dependency);
    if (this.hasDependency(bundle, name)) {
      this.replaceDependency(bundle, this.getDependency(bundle, name), dependency);
    } else {
      this.addDependency(bundle, dependency);
    }
  }

  replaceDependency(bundle, oldDependency, newDependency) {
    let index = bundle.dependencies.indexOf(oldDependency);

    bundle.dependencies[index] = newDependency;
  }

  removeDependency(bundle, dependency) {
    let index = bundle.dependencies.indexOf(dependency);

    bundle.dependencies.splice(index, 1);
  }

  getDependency(bundle, name) {
    return (bundle.dependencies || []).find(item => (item.name || item) === name);
  }

  hasDependency(bundle, name) {
    return this.getDependency(bundle, name) !== undefined;
  }

  hasBundle(bundleName) {
    return this.getBundle(bundleName) !== undefined;
  }

  getBundle(bundleName) {
    let bundles = this.model.build.bundles;
    return bundles.find(item => item.name === bundleName);
  }

  addBundle(bundle) {
    let bundles = this.model.build.bundles;

    bundles.push(bundle);
  }

  removeBundle(bundle) {
    let bundles = this.model.build.bundles;
    let index = bundles.indexOf(bundle);

    bundles.splice(index, 1);
  }

  replaceBundle(oldBundle, newBundle) {
    let bundles = this.model.build.bundles;
    let index = bundles.indexOf(oldBundle);

    bundles[index] = newBundle;
  }

  getDefaultBundle() {
    let bundles = this.model.build.bundles;

    if (bundles.length === 0) {
      throw new Error('There are no bundles in aurelia.json. Please create one');
    }

    return this.getLargestBundle(bundles);
  }

  getLargestBundle(bundles) {
    let largest;

    for (let i = 0; i < bundles.length; i++) {
      if (!largest || (bundles[i].dependencies || []).length > (largest.dependencies || []).length) {
        largest = bundles[i];
      }
    }

    return largest;
  }

  writeAureliaJSON() {
    return fs.writeFile(this.aureliaJSONPath, JSON.stringify(this.model, null, 2), 'utf8');
  }

  applyPatch(instructions) {
    let result = rfc6902.applyPatch(this.model, instructions);
    let errors = result.filter(err => err !== null);

    if (errors.length > 0) {
      throw new Error(`An error occurred while patching aurelia.json.\nErrors: ${errors}`);
    }
  }
};

function getMetadata(dir) {
  return fs.readdir(dir).then(files => {
    return Promise.all(
      files
        .sort()
        .map(file => path.join(dir, file))
        .filter(file => path.extname(file) === '.json')
        .map(file => fs.readFile(file).then(data => JSON.parse(data.toString())))
    );
  });
}

function installBabel() {
  require('babel-polyfill');
  require('babel-register')({
    plugins: [
      'transform-es2015-modules-commonjs'
    ],
    only: /aurelia_project/
  });
}

function installTypeScript() {
  let ts = require('typescript');

  let json = require.extensions['.json'];
  delete require.extensions['.json'];

  require.extensions['.ts'] = function(module, filename) {
    let source = fs.readFileSync(filename);
    let result = ts.transpile(source, {
      module: ts.ModuleKind.CommonJS,
      declaration: false,
      noImplicitAny: false,
      noResolve: true,
      removeComments: true,
      noLib: false,
      emitDecoratorMetadata: true,
      experimentalDecorators: true
    });

    return module._compile(result, filename);
  };

  require.extensions['.json'] = json;
}
