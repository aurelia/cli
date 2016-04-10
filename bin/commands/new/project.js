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
      peerDependencies: {},
      devDependencies: {},
      aurelia: {
        project: Object.assign({}, choices, {
          dependencies: []
        })
      }
    };

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

  addClientDependency(name, version) {
    this.package.aurelia.project.dependencies.push(name);
    this.package.dependencies[name] = version || '*';
  }

  addDevDependency(name, version) {
    this.package.devDependencies[name] = version || '*';
  }

  addDependency(name, version) {
    this.package.dependencies[name] = version || '*';
  }

  addPeerDependency(name, version) {
    this.package.peerDependencies[name] = version || '*';
  }

  create(location) {
    return this.root.create(location);
  }

  install() {
    let npm = new NPM({
      cwd: path.join(process.cwd(), this.content.calculateRelativePath())
    });

    return npm.install();
  }
}
