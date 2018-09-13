'use strict';

const npm = require('./npm').default;


exports.Yarn = class extends npm {
  constructor() {
    super();
    this.executableName = 'yarn';
  }

  installCommand(executablePath, packages) {
    let cmd = `"${executablePath}"`;
    if (packages && packages.length > 0) {
      cmd += ` add ${packages.join(' ')}`;
    }
    return cmd;
  }
};

exports.default = exports.Yarn;
