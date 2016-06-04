"use strict";

exports.CLIOptions = class {
  constructor() {
    exports.CLIOptions.instance = this;
  }

  getEnvironment() {
    return this.getFlag('env') || process.env.NODE_ENV || 'dev';
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

  static getEnvironment() {
    return exports.CLIOptions.instance.getEnvironment();
  }
}
