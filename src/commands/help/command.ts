import { CLIOptions } from "../../cli-options";
import * as ui from "../../ui";
import { Optional } from 'aurelia-dependency-injection';
import { Project } from '../../project';
import * as string from '../../string';

export = class {
  private options: CLIOptions;
  private ui: ui.UI;
  private project: Project;
  static inject() { return [CLIOptions, ui.UI, Optional.of(Project)]; }

  constructor(options: CLIOptions, ui: ui.UI, project: Project) {
    this.options = options;
    this.ui = ui;
    this.project = project;
  }

  async execute(): Promise<void> {
    await this.ui.displayLogo();

    let text: string;
    if (this.options.runningGlobally) {
      text = this.getGlobalCommandText();
    }
    else {
      text = await this.getLocalCommandText();
    }

    this.ui.log(text);
  }

  private getGlobalCommandText() {
    return string.buildFromMetadata([
      require('../new/command.json'),
      require('./command.json')
    ], this.ui.getWidth());
  }

  async getLocalCommandText() {
    const commands = [
      require('../generate/command.json'),
      require('../config/command.json'),
      require('./command.json')
    ];

    const metadata = await this.project.getTaskMetadata();
    
    return string.buildFromMetadata(metadata.concat(commands), this.ui.getWidth());
  }
};
