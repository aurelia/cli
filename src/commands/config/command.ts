import * as os from 'node:os';

import { Configuration } from './configuration';
import { ConfigurationUtilities } from './util';
import { Container } from 'aurelia-dependency-injection';
import { UI } from '../../ui';
import { CLIOptions } from '../../cli-options';

export default class {
  static inject() { return [Container, UI, CLIOptions]; }

  private container: Container;
  private ui: UI;
  private options: CLIOptions;
  private config: Configuration;
  private util: ConfigurationUtilities;

  constructor(container: Container, ui: UI, options: CLIOptions) {
    this.container = container;
    this.ui = ui;
    this.options = options;
  }

  async execute(args: string[]) {
    this.config = new Configuration(this.options);
    this.util = new ConfigurationUtilities(this.options, args);
    const key = this.util.getArg(0) || '';
    const value = this.util.getValue(this.util.getArg(1));
    const save = !CLIOptions.hasFlag('no-save');
    const backup = !CLIOptions.hasFlag('no-backup');
    const action = this.util.getAction(value);

    await this.displayInfo(`Performing configuration action '${action}' on '${key}'${value ? ` with '${value}'` : ''}`);
    await this.displayInfo(this.config.execute(action, key, value));

    if (action !== 'get') {
      if (save) {
        const name = await this.config.save(backup);
        await this.displayInfo('Configuration saved. ' + (backup ? `Backup file '${name}' created.` : 'No backup file was created.'));
      } else {
        await this.displayInfo(`Action was '${action}', but no save was performed!`);
      }
    }
  }

  displayInfo(message: string) {
    return this.ui.log(message + os.EOL);
  }
};
