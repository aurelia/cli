'use strict';
const UI = require('../../ui').UI;

module.exports = class {
  static inject() { return [UI]; }

  constructor(ui) {
    this.ui = ui;
  }

  async execute(context) {
    const answers = await this.ui.multiselect(this.question, this.options);
    context.state[this.stateProperty] = answers.slice();
    context.next(this.nextActivity);
  }
};
