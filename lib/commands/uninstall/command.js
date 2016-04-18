"use strict";
const NPM = require('../npm').NPM;
const uninstall = NPM.prototype.uninstall;

module.exports = class {
  execute(args) {
    let npm = new NPM();
    return uninstall.apply(npm, args);
  }
}
