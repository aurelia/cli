'use strict';

module.exports = class Step {
  constructor(title) {
    this.title = title;
  }

  execute() {
    throw new Error('not implemented');
  }

  getTitle() {
    throw new Error('not implemented');
  }
};
