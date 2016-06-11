"use strict";

exports.CLIOptions = class {
  constructor() {
    exports.CLIOptions.instance = this;
  }

  getEnvironment() {
    return this.getParameter('env') || process.env.NODE_ENV || 'dev';
  }

  hasFlag(name) {
    let lookup = '--' + name;

    if (this.args) {
      return this.args.indexOf(lookup) !== -1;
    }

    return false;
  }

  getParameter(name) {
    let lookup = '--' + name;

    if (this.args) {
      let index = this.args.indexOf(lookup);
      if (index !== -1) {
        return this.args[index + 1] || null;
      }

      return null;
    }

    return null;
  }

  static hasFlag(name) {
    return exports.CLIOptions.instance.hasFlag(name);
  }

  static getParameter(name) {
    return exports.CLIOptions.instance.getParameter(name);
  }

  static getEnvironment() {
    return exports.CLIOptions.instance.getEnvironment();
  }
}
