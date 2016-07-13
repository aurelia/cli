"use strict";
const UI = require('../../ui').UI;

module.exports = class {
  static inject() { return [UI]; }

  constructor(ui) {
    this.ui = ui;
  }

  execute(context) {
    this.ui.ensureAnswer(context.state[this.stateProperty], this.question, this.defaultValue).then(answer => {
      context.state[this.stateProperty] = answer;
      context.next(this.nextActivity);
    });
  }
}
