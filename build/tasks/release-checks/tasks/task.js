const Step = require('../step');
const kill = require('tree-kill');

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

  stop() {
    kill(this.proc.pid, err => {
      if (err) {
        this.reject && this.reject(err);
      } else {
        this.resolve && this.resolve();
      }
    });
  }
};
