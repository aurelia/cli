"use strict";
const ProjectItem = require('../../project-item').ProjectItem;
const NPM = require('../../npm').NPM;
const path = require('path');
const string = require('../../string');
const getSupportedVersion = require('../../dependencies').getSupportedVersion;
const spawn = require('child_process').spawn;
const add = ProjectItem.prototype.add;

exports.ProjectTemplate = class {
  constructor(model, options) {
    this.options = options;
    this.package = {
      name: string.sluggify(model.name),
      description: 'An Aurelia client application.',
      version: '0.1.0',
      repository : {
        type : '???',
        url : '???'
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

    this.scripts = ProjectItem.directory('scripts');

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

    this.projectFolder = ProjectItem.directory('aurelia_project').add(
      this.tasks,
      this.generators,
      this.environments,
      ProjectItem.jsonObject('aurelia.json', this.model)
    );
  }

  get name() {
    return this.package.name;
  }

  configureVisualStudioStructure() {
    this.content = this.root;

    this.addToContent(
      this.projectFolder,
      this.src,
      ProjectItem.directory('wwwroot').add(
        this.scripts.add(
          ProjectItem.resource('require.js', 'scripts/require.js'),
          ProjectItem.resource('text.js', 'scripts/text.js')
        ),
        ProjectItem.resource('index.html', 'content/index.html').askUserIfExists(),
        ProjectItem.resource('favicon.ico', 'img/favicon.ico').skipIfExists()
      ),
      ProjectItem.jsonObject('package.json', this.package).mergeIfExists(),
      ProjectItem.resource('.editorconfig', 'content/editorconfig').skipIfExists(),
      ProjectItem.resource('.gitignore', 'content/gitignore').skipIfExists()
    );
  }

  configureDefaultStructure(content) {
    this.content = content || this.root;

    this.addToContent(
      this.projectFolder,
      this.src,
      this.scripts.add(
        ProjectItem.resource('require.js', 'scripts/require.js'),
        ProjectItem.resource('text.js', 'scripts/text.js')
      ),
      ProjectItem.jsonObject('package.json', this.package),
      ProjectItem.resource('.editorconfig', 'content/editorconfig'),
      ProjectItem.resource('.gitignore', 'content/gitignore'),
      ProjectItem.resource('favicon.ico', 'img/favicon.ico'),
      ProjectItem.resource('index.html', 'content/index.html')
    );
  }

  configureDefaultSetup() {
    this.addToSource(
      ProjectItem.resource('main.ext', 'src/main.ext', this.model.transpiler),
      ProjectItem.resource('app.ext', 'src/app.ext', this.model.transpiler),
      ProjectItem.resource('app.ext', 'src/app.ext', this.model.markupProcessor),
      ProjectItem.resource('environment.ext', 'environments/dev.js', this.model.transpiler)
    ).addToResources(
      ProjectItem.resource('index.ext', 'src/resources/index.ext', this.model.transpiler)
    ).addToTasks(
      ProjectItem.resource('build.ext', 'tasks/build.ext', this.model.transpiler),
      ProjectItem.resource('build.json', 'tasks/build.json'),
      ProjectItem.resource('run.ext', 'tasks/run.ext', this.model.transpiler),
      ProjectItem.resource('run.json', 'tasks/run.json')
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
      ProjectItem.resource('generator.ext', 'generators/generator.ext', this.model.transpiler),
      ProjectItem.resource('generator.json', 'generators/generator.json')
    ).addToEnvironments(
      ProjectItem.resource('dev.ext', 'environments/dev.js', this.model.transpiler),
      ProjectItem.resource('stage.ext', 'environments/stage.js', this.model.transpiler),
      ProjectItem.resource('prod.ext', 'environments/prod.js', this.model.transpiler)
    ).addToClientDependencies(
      'aurelia-bootstrapper',
      'aurelia-fetch-client',
      'aurelia-animator-css',
      'bluebird'
    ).addToDevDependencies(
      'aurelia-cli',
      'aurelia-testing',
      'aurelia-tools',
      'browser-sync',
      'connect-history-api-fallback',
      'gulp',
      'gulp-changed-in-place',
      'gulp-plumber',
      'gulp-rename',
      'gulp-sourcemaps',
      'gulp-notify',
      'minimatch',
      'through2',
      'uglify-js',
      'vinyl-fs'
    );
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

  addToScripts() {
    add.apply(this.scripts, arguments);
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

  create(ui, location) {
    let appRoot = this.src.calculateRelativePath(this.projectFolder.parent);
    let e2eRoot = this.e2eTests.calculateRelativePath(this.projectFolder.parent);

    this.model.paths = Object.assign(this.model.paths, {
      root: appRoot,
      resources: this.resources.calculateRelativePath(this.projectFolder.parent),
      elements: this.elements.calculateRelativePath(this.projectFolder.parent),
      attributes: this.attributes.calculateRelativePath(this.projectFolder.parent),
      valueConverters: this.valueConverters.calculateRelativePath(this.projectFolder.parent),
      bindingBehaviors: this.bindingBehaviors.calculateRelativePath(this.projectFolder.parent)
    });

    let scriptsLocation = this.scripts.calculateRelativePath(this.projectFolder.parent)

    this.model.transpiler.source = path.join(appRoot, '**/*' + this.model.transpiler.fileExtension);
    this.model.markupProcessor.source = path.join(appRoot, '**/*' + this.model.markupProcessor.fileExtension);
    this.model.cssProcessor.source = path.join(appRoot, '**/*' + this.model.cssProcessor.fileExtension);
    this.model.platform.output = scriptsLocation;
    this.model.platform.index = "index.html";

    if (this.model.platform.id === 'aspnetcore') {
      this.model.platform.baseUrl = this.scripts.calculateRelativePath(this.scripts.parent)
    }

    if (this.unitTests.parent) {
      this.model.unitTestRunner.source = path.join(
        this.unitTests.calculateRelativePath(this.projectFolder.parent),
        '**/*' + this.model.transpiler.fileExtension
      );
    }

    this.model.build = {
      "targets": [
        this.model.platform
      ],
      "loader": {
        "type": "require",
        "configTarget": "vendor-bundle.js",
        "includeBundleMetadataInConfig": "auto",
        "plugins": [
          { "name": "text", "extensions": [".html", ".css"], "stub": true }
        ]
      },
      "options": {
        "minify": "stage & prod",
        "sourcemaps": "dev & stage"
      },
      "bundles": [
        {
          "name": "app-bundle.js",
          "source": [
            "[**/*.js]",
            "**/*.{css,html}"
          ]
        },
        {
          "name":"vendor-bundle.js",
          "prepend": [
            "node_modules/bluebird/js/browser/bluebird.core.js",
            `${scriptsLocation}/require.js`
          ],
          "dependencies": [
            "aurelia-binding",
            "aurelia-bootstrapper",
            "aurelia-dependency-injection",
            "aurelia-event-aggregator",
            "aurelia-framework",
            "aurelia-history",
            "aurelia-history-browser",
            "aurelia-loader",
            "aurelia-loader-default",
            "aurelia-logging",
            "aurelia-logging-console",
            "aurelia-metadata",
            "aurelia-pal",
            "aurelia-pal-browser",
            "aurelia-path",
            "aurelia-polyfills",
            "aurelia-route-recognizer",
            "aurelia-router",
            "aurelia-task-queue",
            "aurelia-templating",
            "aurelia-templating-binding",
            {
              "name": "text",
              "path": `../${scriptsLocation}/text`
            },
            {
              "name": "aurelia-templating-resources",
              "path": "../node_modules/aurelia-templating-resources/dist/amd",
              "main": "aurelia-templating-resources"
            },
            {
              "name": "aurelia-templating-router",
              "path": "../node_modules/aurelia-templating-router/dist/amd",
              "main": "aurelia-templating-router"
            },
            {
              "name": "aurelia-testing",
              "path": "../node_modules/aurelia-testing/dist/amd",
              "main": "aurelia-testing",
              "env": "dev"
            }
          ]
        }
      ]
    };

    return this.root.create(ui, location);
  }

  install(ui) {
    let workingDirectory = this.options.hasFlag('here')
      ? process.cwd()
      : path.join(process.cwd(), this.content.calculateRelativePath());

    return installDependencies(ui, workingDirectory)
      .then(() => runPostInstallProcesses(ui, workingDirectory, this.postInstallProcesses));
  }
}

function installDependencies(ui, workingDirectory, dependencies) {
  let npm = new NPM();
  let npmOptions = {
    loglevel: 'error',
    color: 'always',
    save: true,
    'save-dev': true,
    workingDirectory: workingDirectory
  };

  return npm.install([], npmOptions);
}

function addDependencies(current, toAdd) {
  for (var i = 0, ii = toAdd.length; i < ii; ++i) {
    let name = toAdd[i];

    if (name in current) {
      return;
    }

    current[name] = getSupportedVersion(name).replace('\"', '').replace('\"', '');
  }
}

function runPostInstallProcesses(ui, cwd, scripts) {
  let i = -1;

  function run() {
    i++;

    if (i < scripts.length) {
      return runPostInstall(ui, cwd, scripts[i]).then(run);
    } else {
      return Promise.resolve();
    }
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
