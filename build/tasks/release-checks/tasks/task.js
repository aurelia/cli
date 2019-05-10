const Step = require('../step');

module.exports = class Task extends Step {
  constructor(title) {
    super(title);
    this.type = 'task';
  }

  execute() {
    return Promise.resolve();
  }

  getTitle() {
    return `[TASK] ${this.title}`;
  }
};
