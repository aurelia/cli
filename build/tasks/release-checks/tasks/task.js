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
      // ignore windows taskkill error on process not found.
      if (err && !err.message.match(/not found\.\s*$/)) {
        this.reject && this.reject(err);
      } else {
        this.resolve && this.resolve();
      }
    });
  }
};
