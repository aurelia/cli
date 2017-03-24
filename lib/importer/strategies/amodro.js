'use strict';

const fs = require('../../file-system');
const logger = require('aurelia-logging').getLogger('Amodro');
const path = require('path');
const amodroTrace = require('../../build/amodro-trace');
const cjsTransform = require('../../build/amodro-trace/read/cjs');

let AmodroStrategy = class {

  static inject() { return ['package']; }

  constructor(pkg) {
    this.package = pkg;
  }

  applies() {
    if (!this.package.main) {
      logger.debug('This package did not specify a "main" file in package.json. Skipping');
      return false;
    }

    return true;
  }

  execute() {
    this.moduleId = this.package.getModuleId(this.package.main);

    return this.trace(this.package.name, this.moduleId)
    .then(tracedFiles => {
      logger.debug(`The package has ${tracedFiles} dependency file(s).`);

      if (tracedFiles === 0) {
        throw new Error(`Could not trace '${this.package.main}' of the '${this.package.name}' package. There were 0 traced files`);
      }

      return this.package.detectResources()
      .then(() => {
        if (tracedFiles > 1 || this.package.resources.length > 0) {
          logger.debug('Using multi file configuration for this package.');
        } else {
          logger.debug('Using single file configuration for this package.');
          this.package.main = null;
          this.package.path = path.posix.join('../node_modules/', this.package.name, this.moduleId);
        }
      });
    })
    .then(() => {
      return {
        dependencies: [this.package.getConfiguration()]
      };
    });
  }

  trace(packageName, moduleId) {
    let rootDir = path.join(process.cwd(), 'node_modules', packageName);

    let existingFilesMap = {};

    return amodroTrace(
      {
        rootDir: rootDir,
        id: moduleId,
        fileRead: function(defaultRead, id, filePath) {
          if (fs.existsSync(filePath)) {
            existingFilesMap[filePath] = true;
            let contents = fs.readFileSync(filePath).toString();

            return contents;
          }

          existingFilesMap[filePath] = false;

          return '';
        },
        readTransform: function(id, url, contents) {
          return cjsTransform(url, contents);
        }
      }
    ).then(traceResult => {
      let traced = traceResult.traced;
      let found = traced.filter(x => existingFilesMap[x.path]);

      return found.length;
    });
  }

  get name() {
    return 'Amodrotrace Strategy';
  }
};

module.exports = AmodroStrategy;
