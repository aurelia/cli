"use strict";
const UI = require('../../ui').UI;

module.exports = class {
  static inject() { return [UI]; }

  constructor(ui) {
    this.ui = ui;
  }

  execute(context) {
    let overrideProperty = this.stateProperty + 'Override';

    if (overrideProperty in context.state) {
      context.state[this.stateProperty] = context.state[overrideProperty];
      context.next(this.nextActivity);
    } else {
      this.ui.question(this.question, this.options).then(answer => {
        context.state[this.stateProperty] = answer.value;
        context.next(this.nextActivity);
      });
    }
  }
}
