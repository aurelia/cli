'use strict';

const Utils = require('../../../lib/build/utils');
const LogManager = require('aurelia-logging');
const logger = LogManager.getLogger('Runner');

module.exports = class Runner {
  constructor(context) {
    this.context = context;
  }

  async run() {
    const suite = this.context.suite;
    console.log('***********RUNNING SUITE************');
    console.log(`*** Suite: ${suite.title}`);
    console.log(`*** Project: ${this.context.workingDirectory}`);
    console.log('************************************');

    return new Promise(resolve => {
      Utils.runSequentially(
        suite.steps,
        step => {
          logger.info(`Executing ${step.getTitle()}`);

          return Promise.resolve(step.execute(this.context))
          .then(() => {
            return step;
          });
        })
      .then(steps => {
        console.log('**********FINISHED SUITE************');
        console.log(`*** Suite: ${suite.title}`);
        console.log(`*** Project: ${this.context.workingDirectory}`);
        console.log('************************************');

        logger.info('Executed tasks:');
        for (const task of steps.filter(x => x.type === 'task')) {
          logger.info(`- [SUCCESS] ${task.getTitle()}`);
        }
        logger.info('Executed tests:');
        for (const test of steps.filter(x => x.type === 'test')) {
          logger.info(`- [SUCCESS] ${test.getTitle()}`);
        }
      });
    });
  }
};