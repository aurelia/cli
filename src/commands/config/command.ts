const UI = require('../../ui').UI;
const CLIOptions = require('../../cli-options').CLIOptions;
const Container = require('aurelia-dependency-injection').Container;
const os = require('os');

const Configuration = require('./configuration');
const ConfigurationUtilities = require('./util');

module.exports = class {
  static inject() { return [Container, UI, CLIOptions]; }

  constructor(container, ui, options) {
    this.container = container;
    this.ui = ui;
    this.options = options;
  }

  execute(args) {
    this.config = new Configuration(this.options);
    this.util = new ConfigurationUtilities(this.options, args);
    let key = this.util.getArg(0) || '';
    let value = this.util.getValue(this.util.getArg(1));
    let save = !CLIOptions.hasFlag('no-save');
    let backup = !CLIOptions.hasFlag('no-backup');
    let action = this.util.getAction(value);

    this.displayInfo(`Performing configuration action '${action}' on '${key}'`, (value ? `with '${value}'` : ''));
    this.displayInfo(this.config.execute(action, key, value));

    if (action !== 'get') {
      if (save) {
        this.config.save(backup).then((name) => {
          this.displayInfo('Configuration saved. ' + (backup ? `Backup file '${name}' created.` : 'No backup file was created.'));
        });
      } else {
        this.displayInfo(`Action was '${action}', but no save was performed!`);
      }
    }
  }

  displayInfo(message) {
    return this.ui.log(message + os.EOL);
  }
};
