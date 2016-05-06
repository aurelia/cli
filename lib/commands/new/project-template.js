"use strict";
const ProjectItem = require('../../project-item').ProjectItem;
const NPM = require('../../npm').NPM;
const path = require('path');
const add = ProjectItem.prototype.add;

exports.ProjectTemplate = class {
  constructor(model) {
    this.package = {
      name: sluggify(model.name),
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
      source: path.join(appRoot, '**/*.js'),
      html: path.join(appRoot, '**/*.html'),
      styles: path.join(appRoot, '**/*.css'),
      output: this.dist.calculateRelativePath(this.projectFolder.parent),
      e2eSpecsSrc: path.join(e2eRoot, 'src/**/*.js'),
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

function sluggify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
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
