import { Container } from 'aurelia-dependency-injection';
import { UI } from '../../ui';
import { CLIOptions } from '../../cli-options';
import { Project } from '../../project';

import * as string from '../../string';
import * as os from 'node:os';

export default class {
  static inject() { return [Container, UI, CLIOptions, Project]; }

  private container: Container;
  private ui: UI;
  private options: CLIOptions;
  private project: Project;

  constructor(container: Container, ui: UI, options: CLIOptions, project: Project) {
    this.container = container;
    this.ui = ui;
    this.options = options;
    this.project = project;
  }

  async execute(args: string[]) {
    if (args.length < 1) {
      return this.displayGeneratorInfo('No Generator Specified. Available Generators:');
    }

    await this.project.installTranspiler();

    const generatorPath = await this.project.resolveGenerator(args[0]);
    Object.assign(this.options, {
      generatorPath: generatorPath,
      args: args.slice(1)
    });
    if (generatorPath) {
      const module = await import(generatorPath);
      let generator = this.project.getExport(module);

      if (generator.inject) {
        generator = this.container.get(generator);
        generator = generator.execute.bind(generator);
      }

      return generator();
    }
    return this.displayGeneratorInfo(`Invalid Generator: ${args[0]}. Available Generators:`);
  }

  async displayGeneratorInfo(message: string) {
    await this.ui.displayLogo();
    await this.ui.log(message + os.EOL);
    const metadata = await this.project.getGeneratorMetadata();
    const str = string.buildFromMetadata(metadata, this.ui.getWidth());
    return await this.ui.log(str);
  }
};
