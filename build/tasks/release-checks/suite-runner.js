const Utils = require('../../../lib/build/utils');
const suiteSteps = require('./suite-steps');
const StepRunner = require('./step-runner');
const fs = require('../../../lib/file-system');

module.exports = class SuiteRunner {
  constructor(context, reporter) {
    this.context = context;
    this.reporter = reporter;
  }

  async run() {
    if (!fs.existsSync(this.context.resultOutputFolder)) {
      await fs.mkdirp(this.context.resultOutputFolder);
    }
    const {suite} = this.context;

    this.reporter.starting(this.context);

    const steps = await Utils.runSequentially(suiteSteps(suite),
      async(step) => {
        const runner = new StepRunner(step, this.context);
        await runner.run();
        return step;
      });

    this.reporter.finished(steps, this.context);
    return {steps: steps, suite: suite};
  }
};
