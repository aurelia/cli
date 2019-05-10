const Step = require('../step');

module.exports = class Test extends Step {
  constructor(title) {
    super(title);
    this._success = false;
    this.type = 'test';
  }

  execute() {
    return Promise.resolve(this);
  }

  getTitle() {
    return `[TEST] ${this.title}`;
  }

  success() {
    this._success = true;
  }

  fail() {
    this._success = false;
    throw new Error('Test failed');
  }

  getResultText() {
    return this._success ? 'SUCCESS' : 'FAIL';
  }
};
