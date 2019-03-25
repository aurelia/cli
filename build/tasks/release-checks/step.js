const LogManager = require('aurelia-logging');

module.exports = class Step {
  constructor(title) {
    this.logger = LogManager.getLogger(title);
    this.title = title;
  }

  execute() {
    throw new Error('not implemented');
  }

  getTitle() {
    throw new Error('not implemented');
  }
};
