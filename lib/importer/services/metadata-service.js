'use strict';

const copySync = require('../../file-system').copySync;
const join = require('../../file-system').join;
const statSync = require('../../file-system').statSync;
const execSync = require('child_process').execSync;
const logger = require('aurelia-logging').getLogger('Metadata');

let MetadataService = class {

  static inject() { return ['package', 'parameters', 'project']; }

  constructor(pkg, parameters, project) {
    this.package = pkg;
    this.parameters = parameters;
    this.project = project;
  }

  execute(metadata) {
    return Promise.resolve(this.patches(metadata.patches))
      .then(() => this.dependencies(metadata.dependencies))
      .then(() => this.bundles(metadata.bundles))
      .then(() => this.tasks(metadata.tasks))
      .then(() => this.scripts(metadata.scripts))
      .then(() => this.project.writeAureliaJSON());
  }

  patches(instructions) {
    if (!instructions || instructions.length === 0) {
      return;
    }

    this.project.applyPatch(instructions);
  }

  dependencies(metadataDependencies) {
    if (!metadataDependencies || metadataDependencies.length === 0) {
      return;
    }

    let targetBundle = this.project.getBundle(this.parameters.bundle);

    if (!targetBundle) {
      throw new Error(`Could not find target bundle: ${this.parameters.bundle}`);
    }

    logger.info(`Adding/removing dependencies to the '${targetBundle.name}' bundle`);

    for (let metadataDep of metadataDependencies) {
      let name = metadataDep.name || metadataDep;
      let existingDependency = this.project.getDependency(targetBundle, name);

      if (this.parameters.action === 'install') {
        if (!existingDependency) {
          this.project.addDependency(targetBundle, metadataDep);
          logger.info(`The '${name}' dependency has been added.`);
        } else {
          this.project.replaceDependency(targetBundle, existingDependency, metadataDep);
          logger.info(`The '${name}' dependency has been modified.`);
        }
      } else if (this.parameters.action === 'uninstall') {
        this.project.removeDependency(targetBundle, dependency);
        logger.info(`The '${name}' dependency has been removed.`);
      }
    }
  }

  bundles(bundles) {
    if (!bundles || bundles.length === 0) {
      logger.debug('No bundles need to be created');
      return;
    }

    logger.info('Bundles found. Creating new bundles in aurelia.json...');
    for (let bundle of bundles) {
      let existingBundle = this.project.getBundle(bundle.name);

      if (this.parameters.action === 'install') {
        if (!existingBundle) {
          this.project.addBundle(bundle);
          logger.info(`Bundle '${bundle.name}' has been created.`);
        } else {
          this.project.replaceBundle(existingBundle, bundle);
          logger.info(`Bundle '${bundle.name}' has been modified.`);
        }
      } else if (this.parameters.action === 'uninstall') {
        this.project.removeBundle(bundle);
        logger.info(`Bundle '${bundle.name}' has been removed.`);
      }
    }
  }

  scripts(instructions) {
    if (!instructions || instructions.length === 0) {
      return;
    }

    try {
      let scripts = instructions[this.parameters.action];

      if (scripts && scripts.length > 0) {
        logger.info('Scripts found. Executing...');
        for (let script of scripts) {
          logger.info(`Executing: ${script}`);
          execSync(script, {stdio: [0, 1, 2]});
        }
      }

      logger.info('Scripts finished successfully.');
    } catch (e) {
      logger.error('An error occurred during script execution.', e.message);
    }
  }

  tasks(tasks) {
    if (!tasks || tasks.length === 0) {
      logger.debug('No tasks have to be created');
      return;
    }

    logger.info(`${tasks.length} custom task(s) found. Copying to aurelia_project/tasks folder...`);

    let projectFolder = 'aurelia_project/';
    let fileExtension = this.project.getAureliaJSON().transpiler.fileExtension;
    let destFolder = `${projectFolder}tasks/`;

    for (let taskName of tasks) {
      // determinate transpiler to set correct file extension
      let filename = taskName + fileExtension;
      let destFile = destFolder + filename;
      let source = null;

      try {
        // by default, search in installed package directory
        let pkgName = this.parameters.package;
        pkgName = pkgName.indexOf('@') !== -1 ? pkgName.split('@')[0] : pkgName;
        source = join(this.package.pluginPath, 'tasks', taskName);
        copySync(`${source}.js`, destFile);
      } catch (err) {
        logger.error(`Could not copy the '${taskName}' task from '${source}' to '${destFile}`, err);
      }

      // task metadata is optional
      try {
        let fileInfo = statSync(`${source}.json`);
        if (fileInfo.isFile()) {
          copySync(`${source}.json`, `${dest + taskName}.json`);
        }
      } catch (err) {
        if (err.code !== 'ENOENT') {
          logger.error(`Error while copying task metadata '${source}.json': `, err);
        }
      }

      logger.info(`Custom task: ${taskName} has been installed.`);
    }

    logger.info('Custom tasks have been installed successfully.\n');
  }
};

module.exports = MetadataService;
