"use strict";

exports.ProjectBuilder = class {
  constructor(choices) {
    this.choices = choices;
  }

  build() {
    let createProject = require(`./platforms/${this.choices.targetPlatform}`);
    let project = createProject(this.choices, this.choices.name);

    let configureTranspiler = require(`./transpilers/${this.choices.transpiler}`);
    configureTranspiler(project);

    return project.create(process.cwd())
      .then(() => project.install())
      .then(() => project);
  }
}
