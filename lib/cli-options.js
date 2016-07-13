"use strict";

exports.CLIOptions = class {
  constructor() {
    exports.CLIOptions.instance = this;
  }

  getEnvironment() {
    return this.getFlagValue('env') || process.env.NODE_ENV || 'dev';
  }

  hasFlag(name, shortcut) {
    if (this.args) {
      let lookup = '--' + name;
      let found = this.args.indexOf(lookup) !== -1;

      if (found) {
        return true;
      }

      lookup = shortcut || ('-' + name[0]);
      found = this.args.indexOf(lookup) !== -1;

      if (found) {
        return true;
      }

      lookup = '-' + name;
      return this.args.indexOf(lookup) !== -1;
    }

    return false;
  }

  getFlagValue(name, shortcut) {
    if (this.args) {
      let lookup = '--' + name;
      let index = this.args.indexOf(lookup);

      if (index !== -1) {
        return this.args[index + 1] || null;
      }

      lookup = shortcut || ('-' + name[0]);
      index = this.args.indexOf(lookup);

      if (index !== -1) {
        return this.args[index + 1] || null;
      }

      lookup = '-' + name;
      index = this.args.indexOf(lookup);

      if (index !== -1) {
        return this.args[index + 1] || null;
      }

      return null;
    }

    return null;
  }

  static hasFlag(name, shortcut) {
    return exports.CLIOptions.instance.hasFlag(name, shortcut);
  }

  static getFlagValue(name, shortcut) {
    return exports.CLIOptions.instance.getFlagValue(name, shortcut);
  }

  static getEnvironment() {
    return exports.CLIOptions.instance.getEnvironment();
  }
}
