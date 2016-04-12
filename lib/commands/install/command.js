"use strict";
const NPM = require('../npm').NPM;
const install = NPM.prototype.install;

exports.Command = class {
  execute(args) {
    let npm = new NPM();
    return install.apply(npm, args);
  }
}
