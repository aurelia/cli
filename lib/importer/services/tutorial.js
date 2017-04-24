'use strict';

const logger = require('aurelia-logging').getLogger('Tutorial');

module.exports = class {
  static inject() { return ['registry', 'package']; }

  constructor(registry, pkg) {
    this.registry = registry;
    this.package = pkg;
  }

  start(metadata) {
    return Promise.resolve(this.getTutorial(metadata))
    .then(tutorial => {
      logger.info('*********** Tutorial ***********');

      if (tutorial) {
        for (let line of tutorial) {
          logger.info(line);
        }
      } else {
        logger.info(`Are you the maintainer of ${this.package.name} and would you like to define a tutorial that is displayed here?`);
        logger.info(`In order to do so you can add an "aurelia"."import"."tutorial" section to the package.json of ${this.package.name}. This can be set to an array of strings.`);
      }

      if (metadata && metadata.dependencies) {
        let dependenciesWithResources =
          metadata.dependencies.filter(x => x.resources && x.resources.length > 0);

        if (dependenciesWithResources.length > 0) {
          logger.info('*********** Using resources ***********');

          for (let dep of dependenciesWithResources) {
            logger.info(`${dep.name} has resources. The following require statements can be used to load these resources:`);

            for (let resource of dep.resources) {
              logger.info(`<require from="${dep.name}/${resource}"></require>`);
            }
          }
        }
      }

      logger.info('*********** Importing the module ***********');
      logger.info('The following import statements are possible:');
      logger.info(`import '${this.package.name}';`);
      logger.info(`import ${this.package.name} from '${this.package.name}';`);
      logger.info(`import * as ${this.package.name} from '${this.package.name}';`);
      logger.info('We are looking into ways to detect what is the right one');
      logger.info('*********** End of tutorial ***********');
    });
  }

  getTutorial(metadata) {
    if (metadata && metadata.tutorial) {
      return metadata.tutorial;
    }

    let aureliaSection = this.package.packageJSON.aurelia;
    if (aureliaSection &&
        aureliaSection.import &&
        typeof(aureliaSection.import === 'object') &&
        aureliaSection.import.tutorial) {
      return aureliaSection.import.tutorial;
    }

    return this.registry.getPackageConfig(this.package, this.package.version)
    .then(config => {
      if (config) {
        return config.tutorial;
      }
    });
  }
};
