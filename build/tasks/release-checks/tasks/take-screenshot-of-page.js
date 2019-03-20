const Task = require('./task');
const puppeteer = require('puppeteer');
const { killProc } = require('../utils');
const PUPPETEER_TIMEOUT = 5000;

module.exports = class TakeScreenShotOfPage extends Task {
  constructor(url, path) {
    super('Take screenshot of page');

    this.url = url;
    this.path = path;
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

              return page.goto(this.url)
                .then(() => {
                  setTimeout(() => {
                    return page.screenshot({path: this.path})
                      .then(() => browser.close())
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
