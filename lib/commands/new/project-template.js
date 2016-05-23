"use strict";
const ProjectItem = require('../../project-item').ProjectItem;
const NPM = require('../../npm').NPM;
const path = require('path');
const string = require('../../string');
const add = ProjectItem.prototype.add;

exports.ProjectTemplate = class {
  constructor(model) {
    this.package = {
      name: string.sluggify(model.name),
      description: 'An Aurelia client application.',
      version: '0.1.0',
      repository : {
        type : '???',
        url : '???'
      },
      license: 'MIT'
    };

    this.model = Object.assign({}, model, {
      dependencies: []
    });

    this.clientDependencies = [];
    this.dependencies = [];
    this.peerDependencies = [];
    this.devDependencies = [];

    this.root = ProjectItem.directory(model.name);

    this.dist = ProjectItem.directory('dist');
    this.scripts = ProjectItem.directory('scripts');

    this.resources = ProjectItem.directory('resources');
    this.elements = ProjectItem.directory('elements');
    this.attributes = ProjectItem.directory('attributes');
    this.valueConverters = ProjectItem.directory('value-converters');
    this.bindingBehaviors = ProjectItem.directory('binding-behaviors');
    this.src = ProjectItem.directory('src').add(
      this.resources.add(
        this.elements,
        this.attributes,
        this.valueConverters,
        this.bindingBehaviors
      )
    );

    this.styles = ProjectItem.directory('styles');

    this.unitTests = ProjectItem.directory('unit');
    this.e2eTests = ProjectItem.directory('e2e');
    this.tests = ProjectItem.directory('test').add(
      this.unitTests,
      this.e2eTests
    );

    this.tasks = ProjectItem.directory('tasks');
    this.generators = ProjectItem.directory('generators');
    this.environments = ProjectItem.directory('environments');

    this.projectFolder = ProjectItem.directory('aurelia_project').add(
      this.tasks,
      this.generators,
      this.environments,
      ProjectItem.jsonObject('aurelia.json', this.model)
    );
  }

  get name() {
    return this.package.name;
  }

  configureDefaultContentStructure(content) {
    this.content = content;

    this.addToContent(
      this.projectFolder,
      this.src,
      this.dist,
      this.styles,
      this.scripts.add(
        ProjectItem.resource('config.js', 'scripts/config.js'),
        ProjectItem.resource('loader.js', 'scripts/require.js'),
        ProjectItem.resource('text.js', 'scripts/text.js')
      ),
      this.tests,
      ProjectItem.jsonObject('package.json', this.package),
      ProjectItem.resource('.editorconfig', 'content/editorconfig'),
      ProjectItem.resource('.gitignore', 'content/gitignore'),
      ProjectItem.resource('favicon.ico', 'img/favicon.ico'),
      ProjectItem.resource('index.html', 'content/index.html')
    ).addToSource(
      ProjectItem.resource('main.ext', 'src/main.ext', this.model.transpiler),
      ProjectItem.resource('app.ext', 'src/app.ext', this.model.transpiler),
      ProjectItem.resource('app.ext', 'src/app.ext', this.model.markupProcessor)
    ).addToResources(
      ProjectItem.resource('index.ext', 'src/resources/index.ext', this.model.transpiler)
    ).addToUnitTests(
      ProjectItem.resource('setup.ext', 'test/setup.js', this.model.transpiler)
    ).addToTasks(
      ProjectItem.resource('clean.ext', 'tasks/clean.js', this.model.transpiler),
      ProjectItem.resource('clean.json', 'tasks/clean.json'),
      ProjectItem.resource('build.ext', 'tasks/build.js', this.model.transpiler),
      ProjectItem.resource('build.json', 'tasks/build.json')
    ).addToGenerators(
      ProjectItem.resource('attribute.ext', 'generators/attribute.ext', this.model.transpiler),
      ProjectItem.resource('attribute.json', 'generators/attribute.json'),
      ProjectItem.resource('element.ext', 'generators/element.ext', this.model.transpiler),
      ProjectItem.resource('element.json', 'generators/element.json'),
      ProjectItem.resource('value-converter.ext', 'generators/value-converter.ext', this.model.transpiler),
      ProjectItem.resource('value-converter.json', 'generators/value-converter.json'),
      ProjectItem.resource('binding-behavior.ext', 'generators/binding-behavior.ext', this.model.transpiler),
      ProjectItem.resource('binding-behavior.json', 'generators/binding-behavior.json'),
      ProjectItem.resource('task.ext', 'generators/task.ext', this.model.transpiler),
      ProjectItem.resource('task.json', 'generators/task.json'),
      ProjectItem.resource('generator.ext', 'generators/generator.ext', this.model.transpiler),
      ProjectItem.resource('generator.json', 'generators/generator.json')
    ).addToEnvironments(
      ProjectItem.resource('dev.ext', 'environments/dev.js', this.model.transpiler),
      ProjectItem.resource('stage.ext', 'environments/stage.js', this.model.transpiler),
      ProjectItem.resource('prod.ext', 'environments/prod.js', this.model.transpiler)
    ).addToTasks(
      ProjectItem.resource('serve.ext', 'tasks/serve.js', this.model.transpiler),
      ProjectItem.resource('serve.json', 'tasks/serve.json'),
      ProjectItem.resource('run.ext', 'tasks/run.js', this.model.transpiler),
      ProjectItem.resource('run.json', 'tasks/run.json')
    ).addToClientDependencies(
      'aurelia-bootstrapper',
      'aurelia-fetch-client',
      'aurelia-animator-css'
    ).addToDevDependencies(
      'aurelia-cli',
      'browser-sync',
      'del',
      'gulpjs/gulp#4.0',
      'gulp-changed',
      'gulp-plumber',
      'gulp-rename',
      'gulp-sourcemaps',
      'gulp-notify'
    );
  }

  addToRoot() {
    add.apply(this.root, arguments);
    return this;
  }

  addToContent() {
    add.apply(this.content, arguments);
    return this;
  }

  addToSource() {
    add.apply(this.src, arguments);
    return this;
  }

  addToResources() {
    add.apply(this.resources, arguments);
    return this;
  }

  addToTests() {
    add.apply(this.tests, arguments);
    return this;
  }

  addToUnitTests() {
    add.apply(this.unitTests, arguments);
    return this;
  }

  addToE2ETests() {
    add.apply(this.e2eTests, arguments);
    return this;
  }

  addToScripts() {
    add.apply(this.scripts, arguments);
    return this;
  }

  addToTasks() {
    add.apply(this.tasks, arguments);
    return this;
  }

  addToGenerators() {
    add.apply(this.generators, arguments);
    return this;
  }

  addToEnvironments() {
    add.apply(this.environments, arguments);
    return this;
  }

  addToClientDependencies() {
    addDependencies(this.model.dependencies, arguments);
    addDependencies(this.clientDependencies, arguments);
    return this;
  }

  addToDevDependencies() {
    addDependencies(this.devDependencies, arguments);
    return this;
  }

  addToDependencies() {
    addDependencies(this.dependencies, arguments);
    return this;
  }

  addToPeerDependencies() {
    addDependencies(this.peerDependencies, arguments);
    return this;
  }

  create(location) {
    let appRoot = this.src.calculateRelativePath(this.projectFolder.parent);
    let e2eRoot = this.e2eTests.calculateRelativePath(this.projectFolder.parent);

    this.model.paths = {
      root: appRoot,
      source: path.join(appRoot, '**/*' + this.model.transpiler.fileExtension),
      markup: path.join(appRoot, '**/*' + this.model.markupProcessor.fileExtension),
      styles: path.join(appRoot, '**/*' + this.model.cssProcessor.fileExtension),
      output: this.dist.calculateRelativePath(this.projectFolder.parent),
      e2eSpecsSrc: path.join(e2eRoot, 'src/**/*' + this.model.transpiler.fileExtension),
      e2eSpecsDist: path.join(e2eRoot, 'dist/'),
      resources: this.resources.calculateRelativePath(this.projectFolder.parent),
      elements: this.elements.calculateRelativePath(this.projectFolder.parent),
      attributes: this.attributes.calculateRelativePath(this.projectFolder.parent),
      valueConverters: this.valueConverters.calculateRelativePath(this.projectFolder.parent),
      bindingBehaviors: this.bindingBehaviors.calculateRelativePath(this.projectFolder.parent)
    };

    return this.root.create(location);
  }

  install(skip) {
    let workingDirectory = path.join(process.cwd(), this.content.calculateRelativePath());

    return installDependencies(workingDirectory, this.clientDependencies, 'save', skip)
      .then(() => installDependencies(workingDirectory, this.devDependencies, 'save-dev', skip))
      .then(() => installDependencies(workingDirectory, this.dependencies, 'save', skip))
      .then(() => installDependencies(workingDirectory, this.peerDependencies, 'save-peer', skip));
  }
}

function installDependencies(workingDirectory, dependencies, flag, skip) {
  if (skip) {
    for(let i = 0, ii = dependencies.length; i < ii; ++i) {
      console.log(`Skipping install: ${dependencies[i]}`);
    }

    return;
  }

  let npm = new NPM();
  let npmOptions = {
    loglevel: 'error',
    color: 'always',
    [flag]: true,
    workingDirectory: workingDirectory
  };

  return npm.install(dependencies, npmOptions);
}

function addDependencies(current, toAdd) {
  for (var i = 0, ii = toAdd.length; i < ii; ++i) {
    if (current.indexOf(toAdd[i]) === -1) {
      current.push(toAdd[i]);
    }
  }
}
