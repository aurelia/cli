const Task = require('./task');
const LogManager = require('aurelia-logging');
const logger = LogManager.getLogger('change-dir');

module.exports = class ChangeDirectory extends Task {
  constructor() {
    super('Change directory');
  }

  execute(context) {
    logger.debug('changing directory to ' + context.workingDirectory);
    process.chdir(context.workingDirectory);
  }
};
