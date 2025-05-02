import { CLIOptions } from '../../cli-options';
import * as ui from '../../ui';
import { Optional } from 'aurelia-dependency-injection';
import { Project } from '../../project';
import * as string from '../../string';

export default class {
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
      text = await this.getGlobalCommandText();
    }
    else {
      text = await this.getLocalCommandText();
    }

    void this.ui.log(text);
  }

  private async getGlobalCommandText() {
    const commands = await Promise.all([
      import('../new/command.json'),
      import('./command.json')
    ]);
    return string.buildFromMetadata(
      commands.map(c => c.default),
      this.ui.getWidth());
  }

  private async getLocalCommandText() {
    const commands = await Promise.all([
      import('../generate/command.json'),
      import('../config/command.json'),
      import('./command.json')
    ]);

    const metadata = await this.project.getTaskMetadata();
    
    return string.buildFromMetadata(metadata.concat(commands.map(c => c.default)), this.ui.getWidth());
  }
};
