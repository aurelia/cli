'use strict';

const Container = require('aurelia-dependency-injection').Container;
const StrategyLoader = require('./strategy-loader');
const Tutorial = require('./services/tutorial');
const MetadataService = require('./services/metadata-service');
const logger = require('aurelia-logging').getLogger('Importer');

module.exports = class {
  static inject() { return [Container, 'package', StrategyLoader, Tutorial, MetadataService]; }

  constructor(container, pkg, strategyLoader, tutorial, metadataService) {
    this.container = container;
    this.package = pkg;
    this.strategies = strategyLoader.getStrategies();
    this.tutorial = tutorial;
    this.metadataService = metadataService;
  }

  import() {
    if (!this.package.isInstalled()) {
      logger.info(`Package "${this.package.name}" has not been installed. Skipping.`);
      return Promise.resolve();
    }

    logger.info('---------------------------------------------------------');
    logger.info(`*********** Configuring ${this.package.name} ***********`);

    this.package.fetchPackageJSON().parsePackageJSON();

    return this.findStrategy()
    .then(strategy => {
      if (!strategy) {
        throw new Error('No strategies were able to configure this package. Please let us know.');
      }

      logger.info(`[OK] Going to execute the "${strategy.name}" strategy`);

      return Promise.resolve(strategy.execute())
      .catch(err => {
        logger.error(`An error occurred during the exection of the "${strategy.name}" importer strategy`);
        logger.error(err);
        logger.error(err.stack);

        throw err;
      })
      .then(instructions => {
        logger.info(`*********** Finished configuring ${this.package.name} ***********`);

        if (instructions) {
          logger.debug('Applying the following configuration: ', instructions);

          return this.metadataService.execute(instructions)
          .then(() => this.tutorial.start(instructions));
        }

        return this.tutorial.start();
      });
    })
    .then(() => logger.info('---------------------------------------------------------'));
  }

  findStrategy() {
    let index = 0;

    function _findStrategy() {
      if (index === this.strategies.length) {
        return;
      }

      let strategy = this.strategies[index++];

      return Promise.resolve(strategy.applies())
      .then(canExecute => {
        if (!canExecute) {
          logger.debug(`[SKIP] The "${strategy.name}" strategy declined configuration`);

          return _findStrategy.call(this);
        }

        return strategy;
      });
    }

    return _findStrategy.call(this);
  }
};
