'use strict';

const npm = require('./npm').default;

exports.Yarn = class extends npm {
  constructor() {
    super();
    this.executableName = 'yarn';
  }
};

exports.default = exports.Yarn;
