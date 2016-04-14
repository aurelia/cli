"use strict";
const ProjectItem = require('./project-item').ProjectItem;
const NPM = require('../../npm').NPM;
const path = require('path');
const add = ProjectItem.prototype.add;

function sluggify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function installDependencies(workingDirectory, dependencies, flag, skip) {
  let npm = new NPM({ cwd: workingDirectory });
  let index = -1;

  let installer = function() {
    index++;

    if (index < dependencies.length) {
      let current = dependencies[index];

      console.log(`Installing ${current}...`);

      if (skip) {
        return installer();
      } else {
        return npm.install(current, flag).then(installer);
      }
    }

    return Promise.resolve();
  };

  return installer();
}

function addDependencies(current, toAdd) {
  for (var i = 0, ii = toAdd.length; i < ii; ++i) {
    if (current.indexOf(toAdd[i]) === -1) {
      current.push(toAdd[i]);
    }
  }
}

exports.Project = class {
  constructor(choices, rootFolder) {
    this.choices = choices;
    this.package = {
      name: sluggify(choices.name),
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

    this.model = Object.assign({}, choices, {
      dependencies: [],
      paths: {
        oot: appRoot,
        source: appRoot + '**/*.js',
        html: appRoot + '**/*.html',
        css: appRoot + '**/*.css',
        style: 'styles/**/*.css',
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

    this.root = ProjectItem.directory(rootFolder);
    this.src = ProjectItem.directory('src');

    this.tests = ProjectItem.directory('test');
    this.unitTests = ProjectItem.directory('unit');
    this.e2eTests = ProjectItem.directory('e2e');

    this.tasks = ProjectItem.directory('tasks');
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

    return installDependencies(workingDirectory, this.clientDependencies, '--save', skip)
      .then(() => installDependencies(workingDirectory, this.devDependencies, '--save-dev', skip))
      .then(() => installDependencies(workingDirectory, this.dependencies, '--save', skip))
      .then(() => installDependencies(workingDirectory, this.peerDependencies, '--save-peer', skip))
  }
}
