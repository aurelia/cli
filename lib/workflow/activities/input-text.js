"use strict";
const UI = require('../../ui').UI;

module.exports = class {
  static inject() { return [UI]; }

  constructor(ui) {
    this.ui = ui;
  }

  execute(context) {
    if (context.state[this.stateProperty]) {
      context.next(this.nextActivity);
      return;
    }

    this.ui.question(this.question).then(answer => {
      context.state[this.stateProperty] = answer;
      context.next(this.nextActivity);
    });
  }
}
