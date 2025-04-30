const UI = require('../../ui').UI;
const CLIOptions = require('../../cli-options').CLIOptions;
const Container = require('aurelia-dependency-injection').Container;
const Project = require('../../project').Project;
const string = require('../../string');
const os = require('os');

module.exports = class {
  static inject() { return [Container, UI, CLIOptions, Project]; }

  constructor(container, ui, options, project) {
    this.container = container;
    this.ui = ui;
    this.options = options;
    this.project = project;
  }

  execute(args) {
    if (args.length < 1) {
      return this.displayGeneratorInfo('No Generator Specified. Available Generators:');
    }

    this.project.installTranspiler();

    return this.project.resolveGenerator(args[0]).then(generatorPath => {
      Object.assign(this.options, {
        generatorPath: generatorPath,
        args: args.slice(1)
      });

      if (generatorPath) {
        let generator = this.project.getExport(require(generatorPath));

        if (generator.inject) {
          generator = this.container.get(generator);
          generator = generator.execute.bind(generator);
        }

        return generator();
      }

      return this.displayGeneratorInfo(`Invalid Generator: ${args[0]}. Available Generators:`);
    });
  }

  displayGeneratorInfo(message) {
    return this.ui.displayLogo()
      .then(() => this.ui.log(message + os.EOL))
      .then(() => this.project.getGeneratorMetadata())
      .then(metadata => string.buildFromMetadata(metadata, this.ui.getWidth()))
      .then(str => this.ui.log(str));
  }
};
