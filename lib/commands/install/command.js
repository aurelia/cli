"use strict";
const NPM = require('../npm').NPM;
const install = NPM.prototype.install;

module.exports = class {
  execute(args) {
    let npm = new NPM();
    return install.apply(npm, args);
  }
}
