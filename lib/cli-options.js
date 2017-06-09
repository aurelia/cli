'use strict';

const path = require('path');
const readFileSync = require('./file-system').readFileSync;

exports.CLIOptions = class {
  constructor() {
    exports.CLIOptions.instance = this;
  }

  taskName() {
    let name = this.taskPath.split(/[/\\]/).pop();
    let parts = name.split('.');
    parts.pop();
    return parts.join('.');
  }

  getProject() {
    return JSON.parse(readFileSync([process.cwd(), 'aurelia_project', 'aurelia.json'].join('/')));
  }

  getEnvironment() {
    const project = this.getProject();
    let NODE_ENV;
    let env = this.getFlagValue('env') || (process.env.NODE_ENV ? NODE_ENV = process.env.NODE_ENV : undefined) || project.build.defaultEnvironment || 'dev';
    if (NODE_ENV) {
      console.log(`The selected Node Environment (${NODE_ENV}) is not a preconfigured option ('dev', 'stage', and 'prod')`);
    }
    return env;
  }

  getTarget(targetId, env) {
    const project = this.getProject();
    const targets = project.build.targets;
    targetId = targetId || project.build.defaultTarget || 'web';
    env = env || this.getEnvironment();

    let target;
    if (Array.isArray(targets)) {
      target = targets[0];
      target.legacy = true;
    }
    else {
      if (!targets[targetId]) {
        console.log(`No target "${targetId}" found in configuration!`);
      }
      target = Object.assign({}, targets[targetId], targets[targetId].environments[env]);
    }

    if (target.root) {
      target.root = target.root.replace('${ENV}', env).replace('${TARGET}', targetId);
    }
    else {
      target.root = path.join(target.output, '..');
    }

    return target;
  }

  getTargets() {
    const project = this.getProject();
    const targets = project.build.targets;
    const target = this.getFlagValue('target') || project.build.defaultTarget || 'web';
    const env = this.getEnvironment();
    if (Array.isArray(targets)) {
      return [ this.getTarget() ];
    }

    let targetIds = this.resolveTarget(target);
    return targetIds.map((value) => this.getTarget(value, env));
  }

  resolveTarget(targetId) {
    const project = this.getProject();
    const targets = project.build.targets;

    if (!targets[targetId]) {
      console.log(`No target "${targetId}" found in configuration!`);
      return [];
    }

    const target = targets[targetId];
    if (typeof target !== 'string') {
      return [ targetId ];
    }

    let parts = target.split('&').map(x => x.trim());
    let targetIds = parts.reduce((accumulated, current) => accumulated.concat(this.resolveTarget(current)), []);
    return targetIds.filter((current, index, arr) => arr.indexOf(current) == index);
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

  static commandName() {
    return exports.CLIOptions.instance.command;
  }

  static taskName() {
    return exports.CLIOptions.instance.taskName();
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

  static getProject() {
    return exports.CLIOptions.instance.getProject();
  }

  static getTarget(targetId, env) {
    return exports.CLIOptions.instance.getTarget(targetId, env);
  }

  static getTargets() {
    return exports.CLIOptions.instance.getTargets();
  }
};
