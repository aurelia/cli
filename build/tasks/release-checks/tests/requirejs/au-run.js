'use strict';
const Test = require('../test');
const { spawn } = require('child_process');
const LogManager = require('aurelia-logging');
const { checkForJavascriptErrors, killProc } = require('../../utils');

class AuRunDoesNotThrowCommandLineErrors extends Test {
  constructor() {
    super('au run does not throw commandline errors');
  }

  execute() {
    const logger = LogManager.getLogger('AuRunDoesNotThrowCommandLineErrors');

    return new Promise((resolve, reject) => {
      const proc = spawn('au', ['run', '--watch']);

      proc.stdout.on('data', (data) => {
        logger.debug(`stdout: ${data}`);
        if (data.indexOf('error') > -1) {
          killProc(proc);
          reject();
        }
        if (data.indexOf('BrowserSync Available') > -1) {
          killProc(proc);
          resolve();
        }
      });

      proc.stderr.on('data', (data) => {
        logger.error(`stderr: ${data}`);
        killProc(proc);
        reject(`au run had error: ${data}`);
      });

      proc.on('close', (code) => {
        killProc(proc);
        reject(`au run exited with code code ${code}`);
      });
    });
  }
}

class AuRunLaunchesServer extends Test {
  constructor() {
    super('au run launches server');
  }

  execute() {
    const logger = LogManager.getLogger('AuRunLaunchesServer');

    return new Promise((resolve, reject) => {
      const proc = spawn('au', ['run', '--watch']);

      proc.stdout.on('data', (data) => {
        logger.debug(`stdout: ${data}`);
        if (data.indexOf('Application Available At: http://localhost') > -1) {
          killProc(proc);
          resolve();
        }
      });

      proc.stderr.on('data', (data) => {
        logger.error(`stderr: ${data}`);
        killProc(proc);
        reject(`au run had error: ${data}`);
      });

      proc.on('close', (code) => {
        killProc(proc);
        reject(`au run exited with code code ${code}`);
      });
    });
  }
}

class AuRunAppLaunchesWithoutJavascriptErrors extends Test {
  constructor() {
    super('au run app launches without javascript errors');
  }

  execute() {
    const logger = LogManager.getLogger('AuRunAppLaunchesWithoutJavascriptErrors');

    return new Promise((resolve, reject) => {
      const proc = spawn('au', ['run', '--watch']);

      proc.stdout.on('data', (data) => {
        logger.debug(`stdout: ${data}`);
        if (data.indexOf('Application Available At: http://localhost') > -1) {
          const url = getURL(data);
          logger.debug(`starting puppeteer at url ${url}`);

          return checkForJavascriptErrors(url)
          .then(() => {
            killProc(proc);
            resolve();
          })
          .catch(e => {
            killProc(proc);
            reject(e);
          });
        }
      });

      proc.stderr.on('data', (data) => {
        logger.error(`stderr: ${data}`);
        killProc(proc);
        reject(`au run had error: ${data}`);
      });

      proc.on('close', (code) => {
        killProc(proc);
        reject(`au run exited with code code ${code}`);
      });
    });
  }
}

function getURL(msg) {
  const regex = /Application Available At: (.*)/;
  const match = regex.exec(msg);
  return match[1];
}

module.exports = {
  AuRunDoesNotThrowCommandLineErrors: AuRunDoesNotThrowCommandLineErrors,
  AuRunLaunchesServer: AuRunLaunchesServer,
  AuRunAppLaunchesWithoutJavascriptErrors: AuRunAppLaunchesWithoutJavascriptErrors
};
