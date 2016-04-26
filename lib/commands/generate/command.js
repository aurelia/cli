"use strict";
const UI = require('../../ui').UI;
const CLIOptions = require('../../cli').CLIOptions;
const Container = require('aurelia-dependency-injection').Container;
const Project = require('../../project').Project;

module.exports = class {
  static inject() { return [Container, UI, CLIOptions, Project]; };

  constructor(container, ui, options, project) {
    this.container = container;
    this.ui = ui;
    this.options = options;
    this.project = project;
  }

  execute(args) {
    require('babel-polyfill');
    require('babel-register')({
      plugins: [
        'transform-es2015-modules-commonjs'
      ],
      only: /aurelia_project/
    });

    if (args.length < 1) {
      return this.ui.log('No Generator Specified');
    }

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
            generator = generator.execute.bind(task);
          }
        }

        return generator();
      } else {
        return this.ui.log(`Invalid Generator: ${args[0]}`);
      }
    });
  }
}
