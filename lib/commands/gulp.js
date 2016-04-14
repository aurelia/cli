"use strict";

exports.Command = class {
  constructor(commandPath) {
    this.commandPath = commandPath;
  }

  execute(args) {
    console.log('gulp command', this.commandPath);
  }
}
