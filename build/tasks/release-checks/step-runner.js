'use strict';

const LogManager = require('aurelia-logging');
const logger = LogManager.getLogger('StepRunner');

module.exports = class StepRunner {
  constructor(step, context = null) {
    this.step = step;
    this.context = context;
  }

  run() {
    logger.info(`Executing ${this.step.getTitle()}`);

    return this.step.execute(this.context);
  }
};
