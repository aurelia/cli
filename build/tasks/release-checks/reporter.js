const LogManager = require('aurelia-logging');
const logger = LogManager.getLogger('Runner');

module.exports = class Reporter {
  starting(context) {
    const suite = context.suite;
    logger.info('***********RUNNING SUITE************');
    logger.info(`*** Suite: ${suite}`);
    logger.info(`*** Project: ${context.workingDirectory}`);
    logger.info('************************************');
  }

  finished(steps, context) {
    const suite = context.suite;
    this.logSummary(suite, steps);
  }

  logSummary(suite, steps) {
    logger.info('************* RESULT ***************');
    logger.info(`*** Suite: ${suite}`);
    logger.info('************************************');

    logger.info('Executed tasks:');
    for (const task of steps.filter(x => x.type === 'task')) {
      logger.info(`- [SUCCESS] ${task.getTitle()}`);
    }
    logger.info('Executed tests:');
    for (const test of steps.filter(x => x.type === 'test')) {
      logger.info(`- [${test.getResultText()}] ${test.getTitle()}`);
    }
  }
};
