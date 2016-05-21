"use strict";

exports.CLIOptions = class {
  constructor() {
    exports.CLIOptions.instance = this;
  }

  getFlag(value) {
    let name = '--' + value;

    if (this.args) {
      let index = this.args.indexOf(name);
      if (index !== -1) {
        return this.args[index + 1] || null;
      }

      return null;
    }

    return null;
  }

  static getFlag(value) {
    return exports.CLIOptions.instance.getFlag(value);
  }
}
