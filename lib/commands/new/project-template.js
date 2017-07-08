'use strict';
const ProjectItem = require('../../project-item').ProjectItem;
const NPM = require('../../package-managers/npm').NPM;
const Yarn = require('../../package-managers/yarn').Yarn;
const path = require('path');
const string = require('../../string');
const getSupportedVersion = require('../../dependencies').getSupportedVersion;
const transform = require('../../colors/transform');
const os = require('os');
const spawn = require('child_process').spawn;
const add = ProjectItem.prototype.add;
const logger = require('aurelia-logging').getLogger('project-template');

exports.ProjectTemplate = class {
  constructor(model, options, ui) {
    this.options = options;
    this.ui = ui;
    this.package = {
      name: string.sluggify(model.name),
      description: this.description,
      version: '0.1.0',
      repository: {
        type: '???',
        url: '???'
      },
      license: 'MIT',
      dependencies: {},
      peerDependencies: {},
      devDependencies: {}
    };

    this.model = Object.assign({}, model, {
      paths: {}
    });

    this.postInstallProcesses = [];

    this.root = options.hasFlag('here')
      ? ProjectItem.directory(process.cwd())
      : ProjectItem.directory(model.name);

    this.src = ProjectItem.directory('src');

    this.unitTests = ProjectItem.directory('unit');
    this.tests = ProjectItem.directory('test');

    this.tasks = ProjectItem.directory('tasks');
    this.generators = ProjectItem.directory('generators');

    this.manualInstructions = ProjectItem.text('instructions.txt');

    this.projectFolder = ProjectItem.directory('aurelia_project').add(
      this.tasks,
      this.generators,
      ProjectItem.jsonObject('aurelia.json', this.model)
    );
  }

  get name() {
    return this.package.name;
  }

  get description() {
    throw new Error('description property getter must be overriden by child classes.');
  }

  configureDist(directory) {
    this.dist = directory;
    this.projectOutput.add(this.dist);

    return this;
  }

  configureDefaultSetup() {
    throw new Error('configureDefaultSetup must be overriden by child classes.');
  }

  addPostInstallProcess(config) {
    this.postInstallProcesses.push(config);
    return this;
  }

  addToRoot() {
    add.apply(this.root, arguments);
    return this;
  }

  addToContent() {
    add.apply(this.content, arguments);
    return this;
  }

  addToSource() {
    add.apply(this.src, arguments);
    return this;
  }

  addToResources() {
    add.apply(this.resources, arguments);
    return this;
  }

  addToTests() {
    add.apply(this.tests, arguments);
    return this;
  }

  addToUnitTests() {
    add.apply(this.unitTests, arguments);
    return this;
  }

  addToE2ETests() {
    add.apply(this.e2eTests, arguments);
    return this;
  }

  addToDist() {
    add.apply(this.dist, arguments);
    return this;
  }

  addToTasks() {
    add.apply(this.tasks, arguments);
    return this;
  }

  addToGenerators() {
    add.apply(this.generators, arguments);
    return this;
  }

  addToEnvironments() {
    add.apply(this.environments, arguments);
    return this;
  }

  addToClientDependencies() {
    addDependencies(this.package.dependencies, arguments);
    return this;
  }

  addToDevDependencies() {
    addDependencies(this.package.devDependencies, arguments);
    return this;
  }

  addToDependencies() {
    addDependencies(this.package.dependencies, arguments);
    return this;
  }

  addToPeerDependencies() {
    addDependencies(this.package.peerDependencies, arguments);
    return this;
  }

  renderManualInstructions() {
    let instructions = this.manualInstructions.getText();
    if (instructions) {
      this.ui.log(transform('<red><bgWhite>Manual changes are necessary:</bgWhite></red>' + os.EOL));
      this.ui.log(instructions + os.EOL);
      this.ui.log(transform(`If you would like to do this at a later time, we've written these instructions to a file called "${this.manualInstructions.name}" in the project directory for you.` + os.EOL));
    }
  }

  install(ui) {
    let workingDirectory = this.options.hasFlag('here')
      ? process.cwd()
      : path.posix.join(process.cwd(), this.content.calculateRelativePath());

    return installDependencies(ui, workingDirectory)
      .then(() => runPostInstallProcesses(ui, workingDirectory, this.postInstallProcesses));
  }
};

function installDependencies(ui, workingDirectory, dependencies) {
  let npm = new NPM();
  let npmOptions = {
    loglevel: 'error',
    color: 'always',
    save: true,
    'save-dev': true,
    workingDirectory: workingDirectory
  };

  // try yarn, but if something fails then fall back to NPM
  try {
    let yarn = new Yarn();
    if (yarn.isAvailable(workingDirectory)) {
      return yarn.install([], { cwd: workingDirectory })
      .catch(e => {
        logger.error('Something went wrong while attempting to use Yarn. Falling back to NPM');
        logger.info(e);

        return npm.install([], npmOptions);
      });
    }
  } catch (e) {
    logger.error('Something went wrong while attempting to search for Yarn. Falling back to NPM');
    logger.info(e);
  }

  return npm.install([], npmOptions);
}

function addDependencies(current, toAdd) {
  for (let i = 0, ii = toAdd.length; i < ii; ++i) {
    let name = toAdd[i];

    if (name in current) {
      return;
    }

    if (name.indexOf('@') <= 0) {
      current[name] = getSupportedVersion(name).replace('\"', '').replace('\"', '');
    } else {
      let split = name.split('@');
      current[split[0]] = split[1];
    }
  }
}

function runPostInstallProcesses(ui, cwd, scripts) {
  let i = -1;

  function run() {
    i++;

    if (i < scripts.length) {
      return runPostInstall(ui, cwd, scripts[i]).then(run);
    }

    return Promise.resolve();
  }

  return run();
}

function runPostInstall(ui, cwd, config) {
  return ui.log(config.description)
    .then(() => {
      return new Promise((resolve, reject) => {
        const p = spawn(config.command, config.args, { cwd: cwd });
        p.stdout.on('data', data => ui.log(data.toString()));
        p.stderr.on('data', data => reject(data.toString()));
        p.on('close', resolve);
      });
    });
}
