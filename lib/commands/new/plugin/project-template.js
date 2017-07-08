'use strict';
const ProjectTemplate = require('../project-template').ProjectTemplate;
const ProjectItem = require('../../../project-item').ProjectItem;
const path = require('path');
const string = require('../../../string');

exports.PluginTemplate = class extends ProjectTemplate {
  constructor(model, options, ui) {
    super(model, options, ui);

    this.package.main = `dist/commonjs/${string.sluggify(model.name)}.js`;
  }

  get description() {
    return 'An Aurelia plugin.';
  }

  configureDefaultSetup() {
    this.content = this.root;
    this.projectOutput = this.root;
    this.dist = ProjectItem.directory('dist');
    this.projectOutput.add(this.dist);

    this.addToContent(
      this.projectFolder,
      this.src,
      ProjectItem.jsonObject('package.json', this.package),
      ProjectItem.resource('.editorconfig', 'content/editorconfig'),
      ProjectItem.resource('.gitignore', 'content/gitignore')
    );

    this.addToGenerators(
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
    ).addToTasks(
      ProjectItem.resource('build.ext', 'tasks/plugin/build.ext', this.model.transpiler),
      ProjectItem.resource('build.json', 'tasks/plugin/build.json'),
      ProjectItem.resource('clean.ext', 'tasks/clean.ext', this.model.transpiler),
      ProjectItem.resource('copy-files.ext', 'tasks/copy-files.ext', this.model.transpiler),
      ProjectItem.resource('test.ext', 'tasks/plugin/test.ext', this.model.transpiler),
      ProjectItem.resource('test.json', 'tasks/plugin/test.json', this.model.transpiler),
      ProjectItem.resource('transpile.ext', 'tasks/plugin/transpile.ext', this.model.transpiler),
      ProjectItem.resource('watch.ext', 'tasks/watch.ext', this.model.transpiler)
    ).addToSource(
      ProjectItem.resource(`${this.name}.ext`, 'src/index.ext', this.model.transpiler),
      ProjectItem.resource('hello-world.ext', 'src/hello-world.ext', this.model.transpiler),
      ProjectItem.resource('hello-world.ext', 'src/hello-world.ext', this.model.markupProcessor),
      ProjectItem.resource('hello-world.ext', 'src/hello-world.ext', this.model.cssProcessor)
    ).addToDevDependencies(
      'aurelia-cli',
      'aurelia-tools',
      'bluebird',
      'debounce',
      'del',
      'gulp',
      'gulp-changed-in-place',
      'gulp-notify',
      'gulp-plumber',
      'gulp-sourcemaps',
      'gulp-watch',
      'minimatch',
      'vinyl-paths'
    );
  }

  create(ui, location) {
    let appRoot = this.src.calculateRelativePath(this.root);

    this.model.paths = Object.assign(this.model.paths, {
      root: appRoot,
      output: this.dist.calculateRelativePath(this.root)
    });

    this.model.transpiler.source = path.posix.join(appRoot, '**/*' + this.model.transpiler.fileExtension);
    this.model.markupProcessor.source = path.posix.join(appRoot, '**/*' + this.model.markupProcessor.fileExtension);
    this.model.cssProcessor.source = path.posix.join(appRoot, '**/*' + this.model.cssProcessor.fileExtension);

    return this.root.create(ui, location);
  }
};
