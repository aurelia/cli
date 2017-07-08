'use strict';
const ProjectTemplate = require('../project-template').ProjectTemplate;
const ProjectItem = require('../../../project-item').ProjectItem;
const path = require('path');
const fs = require('../../../file-system');
const CLIOptions = require('../../../cli-options').CLIOptions;

exports.ApplicationTemplate = class extends ProjectTemplate {
  constructor(model, options, ui) {
    super(model, options, ui);

    this.resources = ProjectItem.directory('resources');
    this.elements = ProjectItem.directory('elements');
    this.attributes = ProjectItem.directory('attributes');
    this.valueConverters = ProjectItem.directory('value-converters');
    this.bindingBehaviors = ProjectItem.directory('binding-behaviors');
    this.src.add(
      this.resources.add(
        this.elements,
        this.attributes,
        this.valueConverters,
        this.bindingBehaviors
      )
    );

    this.e2eTests = ProjectItem.directory('e2e');

    this.environments = ProjectItem.directory('environments');
    this.projectFolder.add(
      this.environments
    );
  }

  get description() {
    return 'An Aurelia client application.';
  }

  configureVisualStudioStructure() {
    this.content = this.root;

    this.projectOutput = ProjectItem.directory('wwwroot');

    this.addToContent(
      this.projectFolder,
      this.src,
      this.projectOutput.add(
        ProjectItem.resource('favicon.ico', 'img/favicon.ico').skipIfExists()
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
      ProjectItem.directory('Controllers')
      .add(
        ProjectItem.resource('HomeController.cs', 'content/javascriptservices/Controllers/HomeController.cs').skipIfExists()
      ),
      ProjectItem.directory('Views')
      .add(
        ProjectItem.resource('_ViewImports.cshtml', 'content/javascriptservices/Views/_ViewImports.cshtml').skipIfExists(),
        ProjectItem.resource('_ViewStart.cshtml', 'content/javascriptservices/Views/_ViewStart.cshtml').skipIfExists(),
        ProjectItem.directory('Home').add(
          ProjectItem.resource('Index.cshtml', 'content/javascriptservices/Views/Home/Index.cshtml')
          .buildReadmeIfExists(
            ProjectItem.resource('content/javascriptservices/Views/Home/Index.cshtml.readme.txt', 'content/javascriptservices/Views/Home/Index.cshtml.readme.txt'),
            this.manualInstructions,
            this.content
          )
        ),
        ProjectItem.directory('Shared').add(
          ProjectItem.resource('_Layout.cshtml', 'content/javascriptservices/Views/Shared/_Layout.cshtml')
          .buildReadmeIfExists(
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
      ProjectItem.resource('global.json', 'content/javascriptservices/global.json').skipIfExists(),
      ProjectItem.resource('webpack.netcore.config.js', 'content/javascriptservices/webpack.netcore.config.js').skipIfExists()
    );

    this.addToDevDependencies('clean-webpack-plugin');

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
      ProjectItem.resource('favicon.ico', 'img/favicon.ico')
    );

    return this;
  }

  configureDefaultSetup() {
    this.addToSource(
      ProjectItem.resource('app.ext', 'src/app.ext', this.model.transpiler),
      ProjectItem.resource('app.ext', 'src/app.ext', this.model.markupProcessor),
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
      'uglify-js',
      'vinyl-fs'
    );

    return this;
  }

  create(ui, location) {
    let appRoot = this.src.calculateRelativePath(this.root);

    this.model.paths = Object.assign(this.model.paths, {
      root: appRoot,
      resources: this.resources.calculateRelativePath(this.src),
      elements: this.elements.calculateRelativePath(this.src),
      attributes: this.attributes.calculateRelativePath(this.src),
      valueConverters: this.valueConverters.calculateRelativePath(this.src),
      bindingBehaviors: this.bindingBehaviors.calculateRelativePath(this.src)
    });

    this.model.platform.output = this.dist.calculateRelativePath(this.root);

    return this.root.create(ui, location);
  }
};
