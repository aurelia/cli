const LogManager = require('aurelia-logging');
const logger = LogManager.getLogger('StepRunner');
const c = require('ansi-colors');

module.exports = class StepRunner {
  constructor(step, context = null) {
    this.step = step;
    this.context = context;
  }

  run() {
    logger.info(c.inverse(`Executing ${this.step.getTitle()}`));
    return this.step.execute(this.context);
  }
};
