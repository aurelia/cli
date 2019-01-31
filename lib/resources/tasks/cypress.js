import cypress from 'cypress';
import { CLIOptions } from 'aurelia-cli';

export default () => {
  if (CLIOptions.hasFlag('run')) {
    cypress.run();
  } else {
    cypress.open();
  }
}
