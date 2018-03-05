'use strict';
const puppeteer = require('puppeteer');
const PUPPETEER_TIMEOUT = 5000;

function checkForJavascriptErrors(url) {
  return new Promise((resolve, reject) => {
    puppeteer.launch()
    .then(browser => {
      return browser.newPage()
      .then(page => {
        page.on('error', err=> {
          reject(`error: ${err}`);
        });

        page.on('pageerror', pageerr=> {
          reject(`page error: ${pageerr}`);
        });

        page.on('console', msg => {
          if (msg.text().indexOf('error') > -1) {
            reject('page error' + msg.text());
          }
        });

        return page.goto(url)
        .then(() => {
          setTimeout(() => {
            return browser.close()
            .then(() => resolve());
          }, PUPPETEER_TIMEOUT);
        }).catch(e => reject(e));
      });
    });
  });
}

function killProc(proc) {
  proc.stdin.pause();
  proc.kill();
}

module.exports = {
  checkForJavascriptErrors,
  killProc
};

