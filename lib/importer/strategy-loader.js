'use strict';

const fs = require('../file-system');
const Container = require('aurelia-dependency-injection').Container;

let StrategyLoader = class {

  static inject() { return [Container]; }

  constructor(container) {
    this.container = container;
  }

  getStrategies() {
    let files = [
      'metadata',
      'custom-importer',
      'aurelia-registry',
      'jspm-section',
      'browser-section',
      'amodro'
    ];
    let strategies = [];

    for (let file of files) {
      let path = fs.join(__dirname, 'strategies', file);
      let ctor = require(path);
      let strategy = this.container.get(ctor);

      strategies.push(strategy);
    }

    return strategies;
  }
};

module.exports = StrategyLoader;
