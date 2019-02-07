'use strict';
const UI = require('../../ui').UI;

module.exports = class {
  static inject() { return [UI]; }

  constructor(ui) {
    this.ui = ui;
  }

  async execute(context) {
    let overrideProperty = this.stateProperty + 'Override';

    if (overrideProperty in context.state) {
      context.state[this.stateProperty] = context.state[overrideProperty];
    } else {
      const answer = await this.ui.question(this.question, this.options, this.defaultValue);
      context.state[this.stateProperty] = answer;
    }
    context.next(this.nextActivity);
  }
};
