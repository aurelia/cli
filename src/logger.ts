import { UI } from './ui';
import * as c from 'ansi-colors';

interface ILogger {
  id: string;
}

export class Logger {
  static inject() { return [UI]; }
  private ui: UI;

  constructor(ui: UI) {
    this.ui = ui;
  }

  debug(logger: ILogger, message: string, ...rest: any[]) {
    this.log(logger, c.bold('DEBUG'), message, rest);
  }

  info(logger: ILogger, message: string, ...rest: any[]) {
    this.log(logger, c.bold('INFO'), message, rest);
  }

  warn(logger: ILogger, message: string, ...rest: any[]) {
    this.log(logger, c.bgYellow('WARN'), message, rest);
  }

  error(logger: ILogger, message: string, ...rest: any[]) {
    this.log(logger, c.bgRed('ERROR'), message, rest);
  }

  log(logger: ILogger, level: string, message: string, rest: any[]) {
    let msg = `${level} [${logger.id}] ${message}`;

    if (rest.length > 0) {
      msg += ` ${rest.map(x => JSON.stringify(x)).join(' ')}`;
    }

    void this.ui.log(msg);
  }
};
