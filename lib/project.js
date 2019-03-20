const path = require('path');
const fs = require('./file-system');
const _ = require('lodash');
const ProjectItem = require('./project-item').ProjectItem;

exports.Project = class {
  static establish(dir) {
    process.chdir(dir);

    return fs.readFile(path.join(dir, 'aurelia_project', 'aurelia.json')).then(model => {
      return fs.readFile(path.join(dir, 'package.json')).then(pack => {
        return new exports.Project(dir, JSON.parse(model.toString()), JSON.parse(pack.toString()));
      });
    });
  }

  constructor(directory, model, pack) {
    this.directory = directory;
    this.model = model;
    this.package = pack;
    this.taskDirectory = path.join(directory, 'aurelia_project/tasks');
    this.generatorDirectory = path.join(directory, 'aurelia_project/generators');
    this.aureliaJSONPath = path.join(directory, 'aurelia_project', 'aurelia.json');

    this.locations = Object.keys(model.paths).map(key => {
      this[key] = ProjectItem.directory(model.paths[key]);

      if (key !== 'root') {
        this[key] = ProjectItem.directory(model.paths[key]);
        this[key].parent = this.root;
      }

      return this[key];
    });
    this.locations.push(this.generators = ProjectItem.directory('aurelia_project/generators'));
    this.locations.push(this.tasks = ProjectItem.directory('aurelia_project/tasks'));
  }

  // Legacy code. This code and those ProjectItem.directory above, were kept only
  // for supporting `au generate`
  commitChanges() {
    return Promise.all(this.locations.map(x => x.create(this.directory)));
  }

  makeFileName(name) {
    return _.kebabCase(name);
  }

  makeClassName(name) {
    const camel = _.camelCase(name);
    return camel.slice(0, 1).toUpperCase() + camel.slice(1);
  }

  makeFunctionName(name) {
    return _.camelCase(name);
  }

  installTranspiler() {
    switch (this.model.transpiler.id) {
    case 'babel':
      installBabel.call(this);
      break;
    case 'typescript':
      installTypeScript();
      break;
    default:
      throw new Error(`${this.model.transpiler.id} is not a supported transpiler.`);
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
  require('@babel/polyfill');
  require('@babel/register')({
    babelrc: false,
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-transform-modules-commonjs', {loose: true}]
    ],
    only: [/aurelia_project/]
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
