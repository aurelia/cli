'use strict';

const Utils = require('../../../lib/build/utils');
const StepRunner = require('./step-runner');
const fs = require('../../../lib/file-system');

module.exports = class SuiteRunner {
  constructor(context, reporter) {
    this.context = context;
    this.reporter = reporter;
  }

  run() {
    return fs.exists(this.context.resultOutputFolder)
    .then(folderExists => {
      if (!folderExists) {
        return fs.mkdirp(this.context.resultOutputFolder);
      }
    })
    .then(() => {
      const suite = this.context.suite;

      this.reporter.starting(this.context);

      return Utils.runSequentially(
        suite.steps,
        step => {
          return Promise.resolve(new StepRunner(step, this.context).run())
          .then(() => step);
        }
      )
      .then(steps => {
        this.reporter.finished(steps, this.context);
        return {
          steps: steps,
          suite: suite
        };
      });
    });
  }
};
