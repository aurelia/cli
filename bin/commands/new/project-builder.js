"use strict";

exports.ProjectBuilder = class {
  constructor(choices) {
    this.choices = choices;
  }

  build() {
    let createProject = require(`./platforms/${this.choices.targetPlatform}`);
    let project = createProject(this.choices, this.choices.name);

    return project.create(process.cwd())
      .then(() => project.install())
      .then(() => project);
  }
}
