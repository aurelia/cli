'use strict';
const UI = require('../../ui').UI;

module.exports = class {
  static inject() { return [UI]; }

  constructor(ui) {
    this.ui = ui;
  }

  execute(context) {
    return this.ui.multiselect(this.question, this.options).then(answers => {
      context.state[this.stateProperty] = [];

      for (let i = 0; i < answers.length; i++) {
        let answer = answers[i];

        context.state[this.stateProperty].push(answer.value);
      }
      context.next(this.nextActivity);
    });
  }
};
