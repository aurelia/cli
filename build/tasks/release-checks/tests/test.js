'use strict';

const Step = require('../step');

module.exports = class Test extends Step {
  constructor(title) {
    super(title);
    this.type = 'test';
  }

  execute() {
    return Promise.resolve(this);
  }

  getTitle() {
    return `[TEST] ${this.title}`;
  }
};
