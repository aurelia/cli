'use strict';

const logger = require('aurelia-logging').getLogger('Import');

module.exports = class {
  execute(args) {
    logger.warn("'au import' has been removed. You don't need to import anymore, dependencies are traced automatically.");
  }
};
