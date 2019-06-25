const Task = require('./task');
const puppeteer = require('puppeteer');
const { killProc } = require('../utils');
const PUPPETEER_TIMEOUT = 5000;

module.exports = class CheckJavascriptErrors extends Task {
  constructor(url) {
    super('Check javascript errors');

    this.url = url;
  }

  execute() {
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

              return page.goto(this.url)
                .then(() => {
                  setTimeout(() => {
                    return browser.close()
                      .then(resolve);
                  }, PUPPETEER_TIMEOUT);
                }).catch(reject);
            });
        });
    });
  }

  stop() {
    this.resolve();
    killProc(this.proc);
  }

  getTitle() {
    return super.getTitle() + ` (url: ${this.url})`;
  }
};
