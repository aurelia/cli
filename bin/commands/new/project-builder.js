"use strict";

exports.ProjectBuilder = class {
  constructor(choices) {
    this.choices = choices;
  }

  build() {
    try{
      let createProject = require(`./platforms/${this.choices.targetPlatform}`).create;
      let project = createProject(this.choices, this.choices.name);
      return project.create(process.cwd());
    } catch(e) {
      console.error(e);
    }
  }
}
