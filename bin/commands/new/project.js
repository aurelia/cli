"use strict";
const ProjectItem = require('./project-item').ProjectItem;
const add = ProjectItem.prototype.add;

exports.Project = class {
  constructor(choices, rootFolder) {
    this.choices = choices;
    this.package = {
      name: choices.name,
      version: "0.1.0",
      dependencies: {},
      peerDependencies: {},
      devDependencies: {},
      aurelia: {
        project: choices
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

  create(location) {
    return this.root.create(location);
  }

  install() {
    return Promise.resolve();
  }
}
