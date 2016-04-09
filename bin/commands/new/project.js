"use strict";
const ProjectItem = require('./project-item').ProjectItem;

exports.Project = class {
  constructor(choices, rootFolder) {
    this.choices = choices;
    this.root = ProjectItem.directory(rootFolder);
    this.src = ProjectItem.directory('src');
    this.test = ProjectItem.directory('test');
    this.package = {
      name: choices.name,
      version: "0.1.0",
      dependencies: [],
      peerDependencies: [],
      devDependencies: [],
      aurelia: {
        project: choices
      }
    };

    this.test
      .withChild(ProjectItem.directory('unit'))
      .withChild(ProjectItem.directory('e2e'));
  }

  withChild(item) {
    return this.root.withChild(item);
  }

  create(location) {
    return this.root.create(location);
  }
}
