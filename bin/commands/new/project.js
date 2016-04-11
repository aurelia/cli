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

function installDependencies(workingDirectory, dependencies, flag) {
  let npm = new NPM({ cwd: workingDirectory });
  let index = -1;

  let installer = function() {
    index++;

    if (index < dependencies.length) {
      let current = dependencies[index];
      console.log(`Installing ${current}...`);
      return npm.install(current, flag).then(installer);
    }

    return Promise.resolve();
  };

  return installer();
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
      license: 'MIT',
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
      aurelia: {
        project: Object.assign({}, choices, {
          dependencies: []
        })
      }
    };

    this.clientDependencies = [];
    this.dependencies = [];
    this.peerDependencies = [];
    this.devDependencies = [];

    this.root = ProjectItem.directory(rootFolder);
    this.src = ProjectItem.directory('src');

    this.tests = ProjectItem.directory('test');
    this.unitTests = ProjectItem.directory('unit');
    this.e2eTests = ProjectItem.directory('e2e');
  }

  get name() {
    return this.package.name;
  }

  addToRoot() {
    add.apply(this.root, arguments);
  }

  addToContent() {
    add.apply(this.content, arguments);
  }

  addToSource() {
    add.apply(this.src, arguments);
  }

  addToTests() {
    add.apply(this.tests, arguments);
  }

  addToUnitTests() {
    add.apply(this.unitTests, arguments);
  }

  addToE2ETests() {
    add.apply(this.e2eTests, arguments);
  }

  addClientDependency(name) {
    this.package.aurelia.project.dependencies.push(name);
    this.clientDependencies.push(name);
  }

  addDevDependency(name) {
    this.devDependencies.push(name);
  }

  addDependency(name) {
    this.dependencies.push(name);
  }

  addPeerDependency(name) {
    this.peerDependencies.push(name);
  }

  create(location) {
    return this.root.create(location);
  }

  install() {
    let workingDirectory = path.join(process.cwd(), this.content.calculateRelativePath());

    return installDependencies(workingDirectory, this.clientDependencies, '--save')
      .then(() => installDependencies(workingDirectory, this.devDependencies, '--save-dev'))
      .then(() => installDependencies(workingDirectory, this.dependencies, '--save'))
      .then(() => installDependencies(workingDirectory, this.peerDependencies, '--save-peer'))
  }
}
