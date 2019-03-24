const LogManager = require('aurelia-logging');
const _ = require('lodash');

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

  debug(message) {
    this.logger.debug(_.trimEnd(message));
  }
};
