'use strict';

const CLIOptions = require('../cli-options').CLIOptions;

exports.BuildOptions = class {
  constructor(options, defaultOptions, environment) {
    this.options = Object.assign({}, defaultOptions, options);
    this.environment = environment || CLIOptions.getEnvironment();
  }

  getAllOptions() {
    return this.options;
  }

  getValue(propPath) {
    let split = propPath.split('.');
    let cur = this.options;

    for (let i = 0; i < split.length; i++) {
      if (!cur) {
        return undefined;
      }

      cur = cur[split[i]];
    }

    return cur;
  }

  isApplicable(propPath) {
    let value = this.getValue(propPath);

    if (!value) {
      return false;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      return this.matchesEnvironment(value);
    }

    if (value.env) {
      if (typeof value.env === 'boolean') {
        return value.env;
      }

      return this.matchesEnvironment(value.env);
    }

    return false;
  }

  matchesEnvironment(value) {
    let parts = value.split('&').map(x => x.trim().toLowerCase());
    return parts.indexOf(this.environment) !== -1;
  }
};
