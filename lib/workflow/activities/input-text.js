'use strict';
const UI = require('../../ui').UI;

module.exports = class {
  static inject() { return [UI]; }

  constructor(ui) {
    this.ui = ui;
  }

  async execute(context) {
    const answer = await this.ui.ensureAnswer(context.state[this.stateProperty], this.question, this.defaultValue);
    context.state[this.stateProperty] = answer;
    context.next(this.nextActivity);
  }
};
