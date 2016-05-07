"use strict";
const UI = require('../../ui').UI;
const CLIOptions = require('../../cli').CLIOptions;
const Container = require('aurelia-dependency-injection').Container;
const Project = require('../../project').Project;
const string = require('../../string');

module.exports = class {
  static inject() { return [Container, UI, CLIOptions, Project]; };

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
        let generator = this.project.getPrimaryExport(require(generatorPath));

        if (generator.inject) {
          generator = this.container.get(generator);

          if (generator.execute) {
            generator = generator.execute.bind(generator);
          }
        }

        return generator();
      } else {
        return this.displayGeneratorInfo(`Invalid Generator: ${args[0]}. Available Generators:`);
      }
    });
  }

  displayGeneratorInfo(message) {
    return this.ui.displayLogo()
      .then(() => this.ui.log(message))
      .then(() => this.project.getGeneratorMetadata())
      .then(metadata => string.buildFromMetadata(metadata))
      .then(string => this.ui.log(string));
  }
}
