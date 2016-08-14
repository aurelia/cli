"use strict";
const path = require('path');
const fs = require('./file-system');
const string = require('./string');
const ProjectItem = require('./project-item').ProjectItem;

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
    switch(this.model.transpiler.id) {
      case 'babel':
        installBabel();
        break;
      case 'typescript':
        installTypeScript();
        break;
      default:
        throw new Error(`{this.model.transpiler.displayName} is not a supported transpiler.`)
    }
  }

  getExport(m, name) {
    return name ? m[name] : m['default'];
  }

  getGeneratorMetadata() {
    return getMetadata(this.generatorDirectory);
  }

  getTaskMetadata() {
    return getMetadata(this.taskDirectory);
  }

  resolveGenerator(name) {
    let potential = path.join(this.generatorDirectory, `${name}${this.model.transpiler.fileExtension}`);
    return fs.exists(potential).then(result => result ? potential : null);
  }

  resolveTask(name) {
    let potential = path.join(this.taskDirectory, `${name}${this.model.transpiler.fileExtension}`);
    return fs.exists(potential).then(result => result ? potential : null);
  }
}

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
    var source = fs.readFileSync(filename);
    var result = ts.transpile(source, {
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
