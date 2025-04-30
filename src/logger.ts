const UI = require('./ui').UI;
const c = require('ansi-colors');

exports.Logger = class {
  static inject() { return [UI]; }

  constructor(ui) {
    this.ui = ui;
  }

  debug(logger, message) {
    this.log(logger, c.bold('DEBUG'), message, arguments);
  }

  info(logger, message) {
    this.log(logger, c.bold('INFO'), message, arguments);
  }

  warn(logger, message) {
    this.log(logger, c.bgYellow('WARN'), message, arguments);
  }

  error(logger, message) {
    this.log(logger, c.bgRed('ERROR'), message, arguments);
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
