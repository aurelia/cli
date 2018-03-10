'use strict';

const logger = require('aurelia-logging').getLogger('Install');

module.exports = class {
  execute(args) {
    logger.warn("'au install' has been removed, dependencies are traced automatically. Just use npm or yarn to install package.");
  }
};
