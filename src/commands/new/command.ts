const {spawn} = require('child_process');

module.exports = class {
  async execute(args) {
    // Calls "npx makes aurelia/v1"
    // https://github.com/aurelia/v1
    spawn('npx', ['makes', 'aurelia/v1', ...args], {stdio: 'inherit', shell: true});
  }
};

