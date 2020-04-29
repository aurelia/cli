const fs = require('../../../lib/file-system');

exports.MessageHistoryLogger = class {
  constructor(ui) {
    this.ui = ui;
    this.messages = [];
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
    let msg = `${level} ${message}`;
    let args = Array.prototype.slice.call(rest, 2);

    if (args.length > 0) {
      msg += ` ${args.map(x => JSON.stringify(x)).join(' ')}`;
    }

    this.messages.push(msg);

    this.ui.log(msg);
  }

  writeToDisk(filePath) {
    console.log('writing  to ' + filePath);
    return fs.writeFile(filePath, this.messages.join('\r\n'), 'utf-8');
  }

  clearHistory() {
    this.messages = [];
  }
};
