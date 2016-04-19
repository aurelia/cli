"use strict";
const ItemTemplate = require('./item-template').ItemTemplate;
const NPM = require('../../npm').NPM;
const path = require('path');
const add = ItemTemplate.prototype.add;

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

    var appRoot = 'src/';
    var outputRoot = 'dist/';
    var exportSrvRoot = 'export/';

    this.model = Object.assign({}, model, {
      dependencies: [],
      paths: {
        root: appRoot,
        source: appRoot + '**/*.js',
        html: appRoot + '**/*.html',
        styles: appRoot + '**/*.css',
        output: outputRoot,
        exportSrv: exportSrvRoot,
        doc: './doc',
        e2eSpecsSrc: 'test/e2e/src/**/*.js',
        e2eSpecsDist: 'test/e2e/dist/'
      }
    });

    this.clientDependencies = [];
    this.dependencies = [];
    this.peerDependencies = [];
    this.devDependencies = [];

    this.root = ItemTemplate.directory(model.name);
    this.src = ItemTemplate.directory('src');
    this.scripts = ItemTemplate.directory('scripts');
    this.tests = ItemTemplate.directory('test');
    this.unitTests = ItemTemplate.directory('unit');
    this.e2eTests = ItemTemplate.directory('e2e');

    this.tasks = ItemTemplate.directory('tasks');
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
