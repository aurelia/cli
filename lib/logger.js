'use strict';
const UI = require('./ui').UI;

exports.Logger = class {

  static inject() { return [UI]; }

  constructor(ui) {
    this.ui = ui;
  }

  debug(logger, message) {
    this.log(logger, 'DEBUG', message, arguments);
  }

  info(logger, message) {
    this.log(logger, 'INFO', message, arguments);
  }

  warn(logger, message) {
    this.log(logger, 'WARN', message, arguments);
  }

  error(logger, message) {
    this.log(logger, 'ERROR', message, arguments);
  }

  log(logger, level, message, rest) {
    let msg = `${level} [${logger.id}] ${message}`;
    let args = Array.prototype.slice.call(rest, 2);

    if (args.length > 0) {
      msg += ` ${args.map(x => JSON.stringify(x)).join(' ')}`;
    }

    this.ui.log(msg);
  }
};
