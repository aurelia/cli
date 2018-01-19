'use strict';
const ProjectItem = require('../../project-item').ProjectItem;
const NPM = require('../../package-managers/npm').NPM;
const Yarn = require('../../package-managers/yarn').Yarn;
const path = require('path');
const fs = require('../../file-system');
const string = require('../../string');
const getSupportedVersion = require('../../dependencies').getSupportedVersion;
const transform = require('../../colors/transform');
const os = require('os');
const spawn = require('child_process').spawn;
const add = ProjectItem.prototype.add;
const CLIOptions = require('../../cli-options').CLIOptions;
const logger = require('aurelia-logging').getLogger('project-template');

exports.ProjectTemplate = class {
  constructor(model, options, ui) {
    this.options = options;
    this.ui = ui;
    this.package = {
      name: string.sluggify(model.name),
      description: 'An Aurelia client application.',
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

    this.resources = ProjectItem.directory('resources');
    this.elements = ProjectItem.directory('elements');
    this.attributes = ProjectItem.directory('attributes');
    this.valueConverters = ProjectItem.directory('value-converters');
    this.bindingBehaviors = ProjectItem.directory('binding-behaviors');
    this.src = ProjectItem.directory('src').add(
      this.resources.add(
        this.elements,
        this.attributes,
        this.valueConverters,
        this.bindingBehaviors
      )
    );

    this.unitTests = ProjectItem.directory('unit');
    this.e2eTests = ProjectItem.directory('e2e');
    this.tests = ProjectItem.directory('test');

    this.tasks = ProjectItem.directory('tasks');
    this.generators = ProjectItem.directory('generators');
    this.environments = ProjectItem.directory('environments');

    this.manualInstructions = ProjectItem.text('instructions.txt');

    this.aureliaJSON = ProjectItem.jsonObject('aurelia.json', this.model);

    this.projectFolder = ProjectItem.directory('aurelia_project').add(
      this.tasks,
      this.generators,
      this.environments,
      this.aureliaJSON
    );

    this.addedFeatures = {};
  }

  get name() {
    return this.package.name;
  }

  configureVisualStudioStructure() {
    this.content = this.root;

    this.projectOutput = ProjectItem.directory('wwwroot');

    this.addToContent(
      this.projectFolder,
      this.src,
      this.projectOutput.add(
        ProjectItem.resource('favicon.ico', 'img/favicon.ico').skipIfExists().binaryFile()
      ),
      ProjectItem.jsonObject('package.json', this.package).mergeIfExists(),
      ProjectItem.resource('.editorconfig', 'content/editorconfig').skipIfExists(),
      ProjectItem.resource('.gitignore', 'content/gitignore').skipIfExists()
    );

    return this;
  }

  configureJavascriptServices() {
    let projFile = 'project.csproj';

    if (CLIOptions.hasFlag('here')) {
      // use existing csproj if present in project directory
      let csProjs = fs.readdirSync(this.root.name).filter(p => path.extname(p) === '.csproj');
      if (csProjs.length > 0) {
        projFile = csProjs[0];
      }
    }

    this.addToContent(
      ProjectItem.directory('Properties').add(
        ProjectItem.resource('launchSettings.json', 'content/javascriptservices/Properties/launchSettings.json').skipIfExists()
      ),
      ProjectItem.directory('Models').add(
        ProjectItem.resource('ErrorViewModel.cs', 'content/javascriptservices/Models/ErrorViewModel.cs').skipIfExists()
      ),
      ProjectItem.directory('Controllers').add(
        ProjectItem.resource('HomeController.cs', 'content/javascriptservices/Controllers/HomeController.cs').skipIfExists()
      ),
      ProjectItem.directory('Views').add(
        ProjectItem.resource('_ViewImports.cshtml', 'content/javascriptservices/Views/_ViewImports.cshtml').skipIfExists(),
        ProjectItem.resource('_ViewStart.cshtml', 'content/javascriptservices/Views/_ViewStart.cshtml').skipIfExists(),
        ProjectItem.directory('Home').add(
          ProjectItem.resource('Index.cshtml', 'content/javascriptservices/Views/Home/Index.cshtml').buildReadmeIfExists(
            ProjectItem.resource('content/javascriptservices/Views/Home/Index.cshtml.readme.txt', 'content/javascriptservices/Views/Home/Index.cshtml.readme.txt'),
            this.manualInstructions,
            this.content
          )
        ),
        ProjectItem.directory('Shared').add(
          ProjectItem.resource('_Layout.cshtml', 'content/javascriptservices/Views/Shared/_Layout.cshtml').buildReadmeIfExists(
            ProjectItem.resource('content/javascriptservices/Views/Shared/_Layout.cshtml.readme.txt', 'content/javascriptservices/Views/Shared/_Layout.cshtml.readme.txt'),
            this.manualInstructions,
            this.content
          ),
          ProjectItem.resource('Error.cshtml', 'content/javascriptservices/Views/Shared/Error.cshtml').skipIfExists()
        )
      ),
      ProjectItem.resource(projFile, 'content/javascriptservices/project.csproject').skipIfExists(),
      ProjectItem.resource('Program.cs', 'content/javascriptservices/Program.cs').skipIfExists(),
      ProjectItem.resource('Startup.cs', 'content/javascriptservices/Startup.cs')
        .buildReadmeIfExists(
          ProjectItem.resource('Startup.cs.readme.txt', 'content/javascriptservices/Startup.cs.readme.txt'),
          this.manualInstructions,
          this.content
        ),
      ProjectItem.resource('appsettings.json', 'content/javascriptservices/appsettings.json').skipIfExists(),
      ProjectItem.resource('appsettings.Development.json', 'content/javascriptservices/appsettings.Development.json').skipIfExists(),
      ProjectItem.resource('global.json', 'content/javascriptservices/global.json').skipIfExists(),
      ProjectItem.resource('webpack.netcore.config.js', 'content/javascriptservices/webpack.netcore.config.js').skipIfExists()
    );

    this.addToDevDependencies('clean-webpack-plugin');

    return this;
  }

  configureDist(directory) {
    this.dist = directory;
    this.projectOutput.add(this.dist);

    return this;
  }

  // If content is always empty (web.js platform invokes this method without parameters) we can remove it. Otherwise shouldn't we add it in the configureVisualStudioStructure too?
  configureDefaultStructure(content) {
    this.content = content || this.root;
    this.projectOutput = this.root;

    this.addToContent(
      this.projectFolder,
      this.src,
      ProjectItem.jsonObject('package.json', this.package),
      ProjectItem.resource('.editorconfig', 'content/editorconfig'),
      ProjectItem.resource('.gitignore', 'content/gitignore'),
      ProjectItem.resource('favicon.ico', 'img/favicon.ico').binaryFile()
    );

    return this;
  }

  configureDefaultSetup() {
    this.addToSource(
      ProjectItem.resource('app.ext', 'src/app.template.ext', this.model.transpiler)
      .asTemplate(this.model),
      ProjectItem.resource('app.ext', 'src/app.template.ext', this.model.markupProcessor)
        .asTemplate(this.model, { type: this.model.markupProcessor }),
      ProjectItem.resource('environment.ext', 'environments/dev.js', this.model.transpiler)
    ).addToResources(
      ProjectItem.resource('index.ext', 'src/resources/index.ext', this.model.transpiler)
    ).addToGenerators(
      ProjectItem.resource('attribute.ext', 'generators/attribute.ext', this.model.transpiler),
      ProjectItem.resource('attribute.json', 'generators/attribute.json'),
      ProjectItem.resource('element.ext', 'generators/element.ext', this.model.transpiler),
      ProjectItem.resource('element.json', 'generators/element.json'),
      ProjectItem.resource('value-converter.ext', 'generators/value-converter.ext', this.model.transpiler),
      ProjectItem.resource('value-converter.json', 'generators/value-converter.json'),
      ProjectItem.resource('binding-behavior.ext', 'generators/binding-behavior.ext', this.model.transpiler),
      ProjectItem.resource('binding-behavior.json', 'generators/binding-behavior.json'),
      ProjectItem.resource('task.ext', 'generators/task.ext', this.model.transpiler),
      ProjectItem.resource('task.json', 'generators/task.json'),
      ProjectItem.resource('component.ext', 'generators/component.ext', this.model.transpiler),
      ProjectItem.resource('component.json', 'generators/component.json'),
      ProjectItem.resource('generator.ext', 'generators/generator.ext', this.model.transpiler),
      ProjectItem.resource('generator.json', 'generators/generator.json')
    ).addToEnvironments(
      ProjectItem.resource('dev.ext', 'environments/dev.js', this.model.transpiler),
      ProjectItem.resource('stage.ext', 'environments/stage.js', this.model.transpiler),
      ProjectItem.resource('prod.ext', 'environments/prod.js', this.model.transpiler)
    ).addToClientDependencies(
      'aurelia-bootstrapper',
      'aurelia-animator-css',
      'bluebird'
    ).addToDevDependencies(
      'aurelia-cli',
      'aurelia-testing',
      'aurelia-tools',
      'gulp',
      'minimatch',
      'through2',
      'vinyl-fs'
    );

    return this;
  }

  configurePort(port) {
    this.model.platform.port = port;
    return this;
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

  addToAureliaDependencies() {
    this.model.build.bundles[1].dependencies.push(...arguments);
    return this;
  }

  addToAureliaPrepend() {
    this.model.build.bundles[1].prepend.push(...arguments);
    return this;
  }

  addToCopyFiles(files) {
    this.model.build.copyFiles = Object.assign({}, this.model.copyFiles, files);
    return this;
  }

  addFeature(featureName, project, model, options) {
    if (this.addedFeatures[featureName]) {
      return ;
    }
    this.addedFeatures[featureName] = true;
    model.features[featureName] = featureName;
    let feature = require(`../../resources/features/${featureName}`);
    feature(project, model, options);
  }

  renderManualInstructions() {
    let instructions = this.manualInstructions.getText();
    if (instructions) {
      this.ui.log(transform('<red><bgWhite>Manual changes are necessary:</bgWhite></red>' + os.EOL));
      this.ui.log(instructions + os.EOL);
      this.ui.log(transform(`If you would like to do this at a later time, we've written these instructions to a file called "${this.manualInstructions.name}" in the project directory for you.` + os.EOL));
    }
  }

  create(ui, location) {
    let appRoot = this.src.calculateRelativePath(this.root);

    this.model.paths = Object.assign(this.model.paths, {
      root: appRoot,
      // TODO: these paths are not used in systemjs config.
      // We need either removing them or document that they
      // do not work with systemjs
      resources: 'resources',
      elements: 'resources/elements',
      attributes: 'resources/attributes',
      valueConverters: 'resources/value-converters',
      bindingBehaviors: 'resources/binding-behaviors'
    });

    this.model.platform.output = this.dist.calculateRelativePath(this.root);

    return this.root.create(ui, location);
  }

  getWorkingDirectory() {
    return this.options.hasFlag('here')
      ? process.cwd()
      : path.posix.join(process.cwd(), this.content.calculateRelativePath());
  }

  install(ui, packageManager) {
    let workingDirectory = this.getWorkingDirectory();

    return installDependencies(workingDirectory, packageManager)
      .then(() => runPostInstallProcesses(ui, workingDirectory, this.postInstallProcesses));
  }

  savePackageManager(packageManager) {
    this.model.packageManager = packageManager;
    return this.aureliaJSON.create(this.ui, this.getWorkingDirectory());
  }
};

function installDependencies(workingDirectory, packageManager) {
  let npm = new NPM();

  if (packageManager === 'yarn') {
    const yarn = new Yarn();
    return yarn.install([], workingDirectory).catch(e => {
      logger.error('Something went wrong while attempting to use Yarn. Falling back to NPM');
      logger.info(e);

      return npm.install([], workingDirectory);
    });
  } else if (packageManager === 'npm') {
    return npm.install([], workingDirectory);
  }

  throw new Error(`Unknown package manager ${packageManager}`);
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
