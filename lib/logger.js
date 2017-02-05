const UI = require('./ui').UI;

exports.Logger = class {

  static inject() { return [UI]; }
  
  constructor(ui) {
    this.ui = ui;
  }

  debug(logger, message, ...rest){
    this.log(logger, 'DEBUG', message, rest);
  }

  info(logger, message, ...rest){
    this.log(logger, 'INFO', message, rest);
  }

  warn(logger, message, ...rest){
    this.log(logger, 'WARN', message, rest);
  }

  error(logger, message, ...rest){
    this.log(logger, 'ERROR', message, rest);
  }

  log(logger, level, message, rest) {
    let msg = `${level} [${logger.id}] ${message}`;

    if (rest.length > 0) {
      msg += ` ${rest.map(x => JSON.stringify(x)).join(' ')}`;
    }

    this.ui.log(msg);
  }
};