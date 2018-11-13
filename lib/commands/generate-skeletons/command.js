'use strict';
const UI = require('../../ui').UI;
const fs = require('../../file-system');
const CLIOptions = require('../../cli-options').CLIOptions;
const ProjectTemplate = require('../new/project-template').ProjectTemplate;
const logger = require('aurelia-logging').getLogger('generate-skeletons');

module.exports = class {
  static inject() { return [UI, CLIOptions]; }

  constructor(ui, options) {
    this.ui = ui;
    this.options = options;
  }

  execute() {
    let definitionFolder = fs.join(__dirname, 'project-definitions');

    if (this.options.hasFlag('definitions')) {
      definitionFolder = fs.resolve(this.options.getFlagValue('definitions'));

      if (!fs.existsSync(definitionFolder)) {
        logger.error(`The folder ${definitionFolder} does not exist`);
        return Promise.reject();
      }
    }

    return this.getProjectDefinitions(definitionFolder)
      .then(definitions => createProjectsInSeries(this.ui, this.options, definitions)
        .then(() => {
          logger.info('Created all projects');
        })
      );
  }

  getProjectDefinitions(dir) {
    return fs.readdir(dir)
      .then(paths => {
        return paths.filter(x => x.endsWith('.json')).map(x => require(fs.join(dir, x)));
      });
  }
};

function createProjectsInSeries(ui, options, models) {
  let i = -1;
  function createP() {
    i++;

    if (i < models.length) {
      return createProject(ui, options, models[i]).then(createP);
    }

    return Promise.resolve();
  }

  return createP();
}

function createProject(ui, options, model) {
  const project = new ProjectTemplate(model, options, ui);
  project.createNPMScripts = true;

  let configurator = require(`../new/buildsystems/${model.bundler.id}`);
  configurator(project, options);

  return project.create(ui, process.cwd());
}
